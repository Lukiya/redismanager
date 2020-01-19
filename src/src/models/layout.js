import { getDBs, getConfigs } from '../services/api';

export default {

    namespace: 'layout',

    state: {
        list: [],
        configs: {},
    },

    effects: {
        *getDBs({ _ }, { call, put }) {
            const resp = yield call(getDBs);
            yield put({ type: 'saveList', payload: { list: resp } });
        },
        *getConfigs({ _ }, { call, put }) {
            const resp = yield call(getConfigs);
            yield put({ type: 'saveConfigs', payload: { configs: resp } });
        },
    },

    reducers: {
        saveList(state, { payload: { list } }) {
            return {
                ...state,
                list,
            }
        },
        saveConfigs(state, { payload: { configs } }) {
            return {
                ...state,
                configs,
            }
        },
    },
};