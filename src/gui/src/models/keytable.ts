import { IEntryTableModel, IEntryTableModelState, Effect, Reducer, IRedisEntry } from 'umi';
import { getKeys, getHashElements, getListElements, getSetElements, getZSetElements, getEntry, deleteKeys, exportKeys, importKeys, deleteMembers } from '@/services/api';
import { hash } from '@/utils/sha1'
import { message } from 'antd';
import u from '@/utils/u';

function convert(key: string, type: string, resp: any): any[] {
    const r = []
    if (!u.isNoW(resp)) {
        switch (type) {
            case u.HASH:
                for (var propName in resp) {
                    r.push({
                        "Key": key,
                        "Type": type,
                        "Field": propName,
                        "Value": resp[propName],
                    });
                }
                break;
            case u.LIST:
                resp.forEach((x: any, i: number) => {
                    r.push({
                        "Key": key,
                        "Type": type,
                        "Field": i,
                        "Value": x,
                    });
                });
                break;
            case u.SET:
                resp.forEach((x: any) => {
                    r.push({
                        "Key": key,
                        "Type": type,
                        "Field": x,
                        "Value": x,
                    });
                });
                break;
            case u.ZSET:
                resp.forEach((x: any) => {
                    r.push({
                        "Key": key,
                        "Type": type,
                        "Field": x.Score,
                        "Value": x.Member,
                    });
                });
                break;
        }
    }
    return r;
}

interface IKeyTableModel extends IEntryTableModel {
    effects: {
        fetchEntries: Effect;
        fetchSubEntries: Effect;
        refreshEntry: Effect;
        deleteKeys: Effect;
        deleteMembers: Effect;
        copy: Effect;
        paste: Effect;
    };
    reducers: {
        setState: Reducer<IEntryTableModelState>;
        setEntry: Reducer<IEntryTableModelState>;
        removeEntries: Reducer<IEntryTableModelState>;
    };
}

const KeyTableModel: IKeyTableModel = {
    state: {
        DB: -1,
        Entries: [],
        SelectedRowKeys: [],
        SelectedEntries: [],
    },

    effects: {
        *fetchEntries({ payload }, { call, put }) {
            const resp = yield call(getKeys, payload.DB);
            yield put({ type: 'setState', payload: { Entries: resp } });
        },
        *fetchSubEntries({ payload }, { call, put }) {
            let data = [];
            let resp = null;

            switch (payload.Type) {
                case u.HASH:
                    resp = yield call(getHashElements, payload.DB, payload.Key);
                    data = convert(payload.Key, "hash", resp);
                    break
                case u.LIST:
                    resp = yield call(getListElements, payload.DB, payload.Key);
                    data = convert(payload.Key, "list", resp);
                    break
                case u.SET:
                    resp = yield call(getSetElements, payload.DB, payload.Key);
                    data = convert(payload.Key, "set", resp);
                    break
                case u.ZSET:
                    resp = yield call(getZSetElements, payload.DB, payload.Key);
                    data = convert(payload.Key, "zset", resp);
                    break
            }

            yield put({ type: 'setState', payload: { [hash(payload.Key)]: data } });
        },
        *refreshEntry({ payload }, { call, put, select }) {
            const state = yield select((x: any) => x["keytable"]);
            const resp = yield call(getEntry, state.DB, payload.Key);
            yield put({ type: 'setEntry', payload: { entry: resp } });
            yield put({ type: 'fetchSubEntries', payload: { DB: state.DB, Type: resp.Type, Key: resp.Key } });
        },
        *deleteKeys({ _ }, { call, put, select }) {
            const state = yield select((x: any) => x["keytable"]);
            if (state.SelectedEntries.length === 0) {
                return;
            }

            const msgCode = yield call(deleteKeys, state.DB, state.SelectedEntries);
            if (u.isSuccess(msgCode)) {
                yield put({ type: 'removeEntries', payload: { entries: state.SelectedEntries } });
            }
        },
        *deleteMembers({ payload }, { call, put, select }) {
            const state = yield select((x: any) => x["keytable"]);
            const msgCode = yield call(deleteMembers, state.DB, payload.Entries);
            if (u.isSuccess(msgCode)) {
                yield put({ type: 'fetchSubEntries', payload: { DB: state.DB, Type: payload.Type, Key: payload.Key } });
            }
        },
        *copy({ _ }, { call, put, select }) {
            const state = yield select((x: any) => x["keytable"]);
            if (state.SelectedRowKeys.length === 0) {
                return;
            }

            const resp = yield call(exportKeys, state.DB, state.SelectedRowKeys);
            if (u.isSuccess(resp.MsgCode)) {
                u.copyToClipboard(resp.Data);
                message.info(state.SelectedRowKeys.length + " key(s) copied.");
            } else {
                message.error(resp.MsgCode);
            }
        },
        *paste({ clipboardText }, { call, put, select }) {
            const base64Str = clipboardText.substring(u.CLIPBOARD_REDIS.length, clipboardText.length);
            let bytes;
            try {
                bytes = u.base64ToBytesArray(base64Str);
            } catch (err) {
                message.error(err);
                return;
            }

            const state = yield select((x: any) => x["keytable"]);
            const resp = yield call(importKeys, state.DB, bytes);
            if (u.isSuccess(resp.MsgCode)) {
                message.success(resp.Data + " key(s) pasted.");
            } else {
                message.error(resp.MsgCode);
            }
            yield put({ type: 'fetchEntries', payload: { DB: state.DB } });   // Refresh
        },
    },
    reducers: {
        setState(state, { payload }) {
            return {
                ...state,
                ...payload,
            };
        },
        setEntry(state: any, { payload }) {
            let exists = false;
            const newList = state?.Entries.map((x: any) => {
                if (x.Key === payload.entry.Key) {
                    exists = true;
                    return payload.entry;
                } else {
                    return x;
                }
            });

            if (!exists) {
                newList?.push(payload.entry);
            }

            return {
                ...state,
                Entries: newList,
            };
        },
        removeEntries(state: any, { payload: { entries } }) {
            const newList = state?.Entries.filter((x: IRedisEntry) => {
                let found = false;
                for (let i = 0; i < entries.length; i++) {
                    if (entries[i].Key === x.Key) {
                        found = true;
                        break;
                    }
                }
                return !found;
            });

            return {
                ...state,
                SelectedEntries: [],
                SelectedRowKeys: [],
                Entries: newList,
            }
        },
    },
    subscriptions: {
        setup({ dispatch, history }) {
            return history.listen(({ pathname }) => {
                var t = pathname.match(/^\/db\/(\d+)$/);
                if (t !== null && t.length > 1) {
                    const db = parseInt(t[1]);
                    dispatch({ type: "fetchEntries", payload: { DB: db } });
                    dispatch({ type: "setState", payload: { DB: db } });
                }
            });
        }
    },
};

export default KeyTableModel;