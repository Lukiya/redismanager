import { getKeys, deleteEntries, getEntry, exportKeys, importKeys } from '../services/api';
import { Message } from 'antd';
import u from '../utils/utils';

export default {
    namespace: 'keyList',

    state: {
        db: 0,
        list: [],
        selectedEntries: [],
        selectedRowKeys: [],
        isBusy: false,
        deletingConfirmVisible: false,
    },

    effects: {
        *init({ db }, { call, put }) {
            yield put({ type: 'setDB', payload: { db: db } });
            yield put({ type: 'getKeys' });
        },
        *getKeys({ _ }, { call, put, select }) {
            yield put({ type: 'setSelections', payload: { selectedEntries: [], selectedRowKeys: [] } });
            const state = yield select(states => states["keyList"]);
            yield put({ type: 'setBusy', payload: { isBusy: true } });
            const resp = yield call(getKeys, state.db);
            yield put({ type: 'setList', payload: { list: resp } });
            yield put({ type: 'setBusy', payload: { isBusy: false } });
        },
        *refreshEntry({ key }, { call, put, select }) {
            const state = yield select(states => states["keyList"]);
            yield put({ type: 'setBusy', payload: { isBusy: true } });
            const resp = yield call(getEntry, state.db, key);
            yield put({ type: 'setEntry', payload: { entry: resp } });
            yield put({ type: 'setBusy', payload: { isBusy: false } });

            switch (resp.Type) {
                case "hash":
                    yield put({ type: 'hash/getHashElements', redisKey: key });
                    break;
                case "list":
                    yield put({ type: 'list/getListElements', redisKey: key });
                    break;
                case "set":
                    yield put({ type: 'set/getSetElements', redisKey: key });
                    break;
                case "zset":
                    yield put({ type: 'zset/getZSetElements', redisKey: key });
                    break;
                default:
                    break;
            }
        },
        *deleteEntries({ _ }, { call, put, select }) {
            const state = yield select(states => states["keyList"]);
            if (state.selectedEntries.length === 0) {
                return;
            }

            yield put({ type: 'setBusy', payload: { isBusy: true } });
            const msgCode = yield call(deleteEntries, state.db, state.selectedEntries);
            yield put({ type: 'setBusy', payload: { isBusy: false } });
            if (u.isSuccess(msgCode)) {
                yield put({ type: 'removeEntries', payload: { entries: state.selectedEntries } });
            }
            yield put({ type: 'setDeletingDialogVisible', payload: { flag: false } });
        },
        *copy({ _ }, { call, put, select }) {
            const state = yield select(states => states["keyList"]);
            if (state.selectedRowKeys.length === 0) {
                return;
            }

            yield put({ type: 'setBusy', payload: { isBusy: true } });
            const resp = yield call(exportKeys, state.db, state.selectedRowKeys);
            if (resp.MsgCode === "") {
                u.copyToClipboard(resp.Data);
                Message.info(state.selectedRowKeys.length + " key(s) copied.");
            } else {
                Message.error(resp.MsgCode);
            }
            yield put({ type: 'setBusy', payload: { isBusy: false } });
        },
        *paste({ clipboardText }, { call, put, select }) {
            const base64Str = clipboardText.substring(u.CLIPBOARD_REDIS.length, clipboardText.length);
            let bytes;
            try {
                bytes = u.base64ToBytesArray(base64Str);
            } catch (err) {
                Message.error(err);
                return;
            }

            const state = yield select(states => states["keyList"]);
            yield put({ type: 'setBusy', payload: { isBusy: true } });
            const resp = yield call(importKeys, state.db, bytes);
            if (resp.MsgCode === "") {
                Message.success(resp.Data + " key(s) pasted.");
            } else {
                Message.error(resp.MsgCode);
            }
            yield put({ type: 'setBusy', payload: { isBusy: false } });
            yield put({ type: 'getKeys' });   // Refresh
        },
    },

    reducers: {
        setList(state, { payload: { list } }) {
            return {
                ...state,
                list,
            }
        },
        setEntry(state, { payload: { entry } }) {
            let exists = false;
            const newList = state.list.map(x => {
                if (x.Key === entry.Key) {
                    exists = true;
                    return entry;
                } else {
                    return x;
                }
            });

            if (!exists) {
                newList.push(entry);
            }

            return {
                ...state,
                list: newList,
            }
        },
        removeEntries(state, { payload: { entries } }) {
            const newList = state.list.filter(x => {
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
                selectedEntries: [],
                list: newList,
            }
        },
        setDB(state, { payload: { db } }) {
            return {
                ...state,
                db,
            }
        },
        setBusy(state, { payload: { isBusy } }) {
            return {
                ...state,
                isBusy,
            }
        },
        setDeletingDialogVisible(state, { payload: { flag } }) {
            return {
                ...state,
                deletingConfirmVisible: flag,
            }
        },
        setSelections(state, { payload: { selectedRowKeys, selectedEntries } }) {
            return {
                ...state,
                selectedRowKeys,
                selectedEntries,
            }
        },
        exportFile(state, { _ }) {
            if (u.isNoW(state.selectedRowKeys) || state.selectedRowKeys.length === 0) {
                return state;
            }
            
            const keys = state.selectedRowKeys.join(",");

            const f = document.createElement("form");
            f.setAttribute("action", process.env.apiURL + "/export/file?db=" + state.db);
            f.setAttribute("method", "post");
            f.setAttribute("target", "download");
            const i = document.createElement("input");
            i.setAttribute("type", "hidden");
            i.setAttribute("name", "keys");
            i.setAttribute("value", keys);
            f.append(i);
            document.body.append(f);
            f.submit();
            f.remove();

            return state;
        }
    },
};