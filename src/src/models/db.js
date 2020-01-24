import { getKeys } from '../services/api';

export default {
    namespace: 'db',

    state: {
        list: [],
        isBusy: false,
        editorVisible: false,
        editingEntry: {},
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
        showEditor(state, { editingEntry }) {
            return {
                ...state,
                editorVisible: true,
                editingEntry: editingEntry
            }
        },
        hideEditor(state, { _ }) {
            return {
                ...state,
                editorVisible: false,
            }
        },
    },
};