import { getHashList } from '../services/api';

export default {
    namespace: 'hash',

    state: {
        list: [],
        isBusy: false
    },

    effects: {
        *getHashList({ redisKey }, { call, put }) {
            yield put({ type: 'setBusy', payload: { isBusy: true } });
            const resp = yield call(getHashList, redisKey);
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
        }
    },
};