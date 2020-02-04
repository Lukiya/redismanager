import { getKeys, deleteEntries } from '../services/api';
import u from '../utils/utils';

export default {
    namespace: 'keyList',

    state: {
        db: 0,
        list: [],
        selectedEntries: [],
        isBusy: false,
        deletingVisible: false,
    },

    effects: {
        *init({ db }, { call, put }) {
            yield put({ type: 'setSelectedEntries', entries: [] });
            yield put({ type: 'setDB', payload: { db: db } });
            yield put({ type: 'getKeys' });
        },
        *getKeys({ _ }, { call, put, select }) {
            const state = yield select(states => states["keyList"]);
            yield put({ type: 'setBusy', payload: { isBusy: true } });
            const resp = yield call(getKeys, state.db);
            yield put({ type: 'saveList', payload: { list: resp } });
            yield put({ type: 'setBusy', payload: { isBusy: false } });
        },
        *deleteEntries({ entries }, { call, put, select }) {
            const state = yield select(states => states["keyList"]);

            yield put({ type: 'setBusy', payload: { isBusy: true } });
            const msgCode = yield call(deleteEntries, state.selectedEntries);
            yield put({ type: 'setBusy', payload: { isBusy: false } });
            if (u.isSuccess(msgCode)) {
                yield put({ type: 'getKeys' });
            }
            yield put({ type: 'setDeletingVisible', payload: { flag: false } });
        }
    },

    reducers: {
        saveList(state, { payload: { list } }) {
            return {
                ...state,
                list,
            }
        },
        setDB(state, { payload: { db } }) {
            return {
                ...state,
                db,
            }
        },
        setBusy(state, { payload: { isBusy } }) {
            return {
                ...state,
                isBusy,
            }
        },
        setDeletingVisible(state, { payload: { flag } }) {
            return {
                ...state,
                deletingVisible: flag,
            }
        },
        setSelectedEntries(state, { entries }) {
            return {
                ...state,
                selectedEntries: entries,
            }
        },
    },
};