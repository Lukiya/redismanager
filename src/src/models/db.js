import { getKeys } from '../services/api';

export default {
    namespace: 'db',

    state: {
        list: [],
        selectedKeys: [],
        isBusy: false,
    },

    effects: {
        *getKeys({ db }, { call, put }) {
            yield put({ type: 'setBusy', payload: { isBusy: true } });
            const resp = yield call(getKeys, db);
            yield put({ type: 'saveList', payload: { list: resp } });
            yield put({ type: 'setBusy', payload: { isBusy: false } });
        }
    },

    reducers: {
        saveList(state, { payload: { list } }) {
            return {
                ...state,
                list,
            }
        },
        setBusy(state, { payload: { isBusy } }) {
            return {
                ...state,
                isBusy
            }
        },
        setSelectedKeys(state, { selectedKeys }) {
            return {
                ...state,
                selectedKeys
            }
        }
    },
};