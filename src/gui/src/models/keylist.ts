import { Effect, Reducer, Subscription } from 'umi';
import { getKeys } from '@/services/api'

export interface IKeyDTO {
    Key: string;
    Type: string;
    Field: string;
    Value: string;
    TTL: number;
    Length: number;
    IsNew: boolean;
}

export interface IKeyListModelState {
    Keys: IKeyDTO[];
    DB: number;
}

export interface IKeyListModel {
    namespace: 'keylist';
    state: IKeyListModelState;
    effects: {
        fetchKeys: Effect;
    };
    reducers: {
        saveState: Reducer<IKeyListModelState>;
    };
    subscriptions: { setup: Subscription };
}

const KeyListModel: IKeyListModel = {
    namespace: 'keylist',

    state: {
        Keys: [],
        DB: -1,
    },

    effects: {
        *fetchKeys({ payload }, { call, put }) {
            const resp = yield call(getKeys, payload.db);
            yield put({ type: 'saveState', payload: { Keys: resp } });
        },
    },
    reducers: {
        saveState(state, action) {
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
                    dispatch({ type: "fetchKeys", payload: { db } });
                    dispatch({ type: "saveState", payload: { DB: db } });
                }
            });
        }
    },
};

export default KeyListModel;