import { getListElements } from '../services/api';

export default {
    namespace: 'list',

    state: {
        list: {},
        isBusy: false
    },

    effects: {
        *getListElements({ redisKey }, { call, put }) {
            yield put({ type: 'setBusy', payload: { isBusy: true } });
            const resp = yield call(getListElements, redisKey);
            yield put({ type: 'saveList', payload: { redisKey: redisKey, list: resp } });
            yield put({ type: 'setBusy', payload: { isBusy: false } });
        }
    },

    reducers: {
        saveList(state, { payload: { redisKey, list } }) {
            state.list[redisKey] = list;
            return state
        },
        setBusy(state, { payload: { isBusy } }) {
            return {
                ...state,
                isBusy
            }
        }
    },
};