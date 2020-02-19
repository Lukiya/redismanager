import { deleteKeys, getHashElements } from '../services/api';
import u from '../utils/utils';

export default {
    namespace: 'hash',

    state: {
        list: {},
        isBusy: false
    },

    effects: {
        *getHashElements({ db, redisKey }, { call, put }) {
            yield put({ type: 'setBusy', payload: { isBusy: true } });
            const resp = yield call(getHashElements, db, redisKey);
            yield put({ type: 'saveList', payload: { redisKey: redisKey, list: resp } });
            yield put({ type: 'setBusy', payload: { isBusy: false } });
        },
        *deleteEntry({ db, record }, { call, put }) {
            yield put({ type: 'setBusy', payload: { isBusy: true } });
            const msgCode = yield call(deleteKeys, db, new Array(record));
            yield put({ type: 'setBusy', payload: { isBusy: false } });

            if (u.isSuccess(msgCode)) {
                yield put({ type: 'removeEntry', entry: record });
            }
        },
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
        removeEntry(state, { entry }) {
            const newList = state.list.filter(x => {
                return x.Key !== entry.Key && x.Field !== entry.Field;
            });

            return {
                ...state,
                selectedEntries: [],
                list: newList,
            }
        },
    },
};