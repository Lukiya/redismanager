import { IEntryTableModel, Effect } from 'umi';
import { getHashElements } from '@/services/api';

interface IHashTableModel extends IEntryTableModel {
}

const HashTableModel: IHashTableModel = {
    state: {
        DB: -1,
        Entries: [],
        SelectedRowKeys: [],
        SelectedEntries: [],
    },

    effects: {
        *fetchEntries({ payload }, { call, put }) {
            const resp = yield call(getHashElements, payload.db, payload.key);
            yield put({ type: 'setState', payload: { Entries: resp } });
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
                    dispatch({ type: "setState", payload: { DB: db } });
                }
            });
        }
    },
};

export default HashTableModel;