import { getEntry } from '../services/api';

export default {
    namespace: 'editor',

    state: {
        entry: {},
        isBusy: false,
    },

    effects: {
        *getEntry({ redisKey, redisField }, { call, put }) {
            yield put({ type: 'setBusy', payload: { isBusy: true } });
            const resp = yield call(getEntry, redisKey, redisField);
            yield put({ type: 'saveEntry', payload: { entry: resp } });
            yield put({ type: 'setBusy', payload: { isBusy: false } });
        }
    },

    reducers: {
        saveEntry(state, { payload: { entry } }) {
            return {
                ...state,
                entry,
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