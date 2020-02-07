import { getSetElements } from '../services/api';

export default {
    namespace: 'set',

    state: {
        // db: 0,
        list: {},
        isBusy: false
    },

    effects: {
        *getSetElements({ db, redisKey }, { call, put }) {
            // yield put({ type: 'setDB', payload: { db } });
            yield put({ type: 'setBusy', payload: { isBusy: true } });
            const resp = yield call(getSetElements, db, redisKey);
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
        },
        // setDB(state, { payload: { db } }) {
        //     return {
        //         ...state,
        //         db
        //     }
        // }
    },
};