import { getKeys } from '../services/api';

export default {
    namespace: 'db',

    state: {
        keyList: [],
        isBusy: false,
    },

    effects: {
        *getKeys({ db }, { call, put }) {
            yield put({ type: 'setBusy', payload: { isBusy: true } });
            const resp = yield call(getKeys, db);
            yield put({ type: 'saveKeys', payload: { keyList: resp } });
            yield put({ type: 'setBusy', payload: { isBusy: false } });
        }
    },

    reducers: {
        saveKeys(state, { payload: { keyList } }) {
            return {
                ...state,
                keyList,
            }
        },
        setBusy(state, { payload: { isBusy } }) {
            return {
                ...state,
                isBusy
            }
        }
    },
};