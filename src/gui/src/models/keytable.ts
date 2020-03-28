import { IEntryTableModel, IEntryTableModelState, Effect, Reducer } from 'umi';
import { getKeys, getHashElements, getListElements, getSetElements, getZSetElements } from '@/services/api';
import { hash } from '@/utils/sha1'
import u from '@/utils/u';

function convert(key: string, type: string, resp: any): any[] {
    const r = []
    if (!u.isNoW(resp)) {
        for (var propName in resp) {
            r.push({
                "Key": key,
                "Type": type,
                "Field": propName,
                "Value": resp[propName],
            });
        }
    }
    return r;
}

interface IKeyTableModel extends IEntryTableModel {
    effects: {
        fetchEntries: Effect;
        fetchSubEntries: Effect;
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
            const resp = yield call(getKeys, payload.db);
            yield put({ type: 'setState', payload: { Entries: resp } });
        },
        *fetchSubEntries({ payload }, { call, put }) {
            let data = [];
            let resp = null;

            switch (payload.type) {
                case "hash":
                    resp = yield call(getHashElements, payload.db, payload.key);
                    data = convert(payload.key, "hash", resp);
                    break
                case "list":
                    resp = yield call(getListElements, payload.db, payload.key);
                    data = convert(payload.key, "list", resp);
                    break
                case "set":
                    resp = yield call(getSetElements, payload.db, payload.key);
                    data = convert(payload.key, "set", resp);
                    break
                case "zset":
                    resp = yield call(getZSetElements, payload.db, payload.key);
                    data = convert(payload.key, "zset", resp);
                    break
            }

            yield put({ type: 'setState', payload: { [hash(payload.key)]: data } });
        },
    },
    reducers: {
        setState(state, action) {
            return {
                ...state,
                ...action.payload,
            };
        },
    },
    subscriptions: {
        setup({ dispatch, history }) {
            return history.listen(({ pathname }) => {
                var t = pathname.match(/^\/db\/(\d+)$/);
                if (t !== null && t.length > 1) {
                    const db = parseInt(t[1]);
                    dispatch({ type: "fetchEntries", payload: { db } });
                    dispatch({ type: "setState", payload: { DB: db } });
                }
            });
        }
    },
};

export default KeyTableModel;