import { getDBs, getConfigs } from '../services/api';

export default {

    namespace: 'layout',

    state: {
        dbList: [],
        configs: {},
    },

    effects: {
        *getDBs({ _ }, { call, put }) {
            const resp = yield call(getDBs);
            yield put({ type: 'saveDBs', payload: { dbList: resp } });
        },
        *getConfigs({ _ }, { call, put }) {
            const resp = yield call(getConfigs);
            yield put({ type: 'saveConfigs', payload: { configs: resp } });
        },
    },

    reducers: {
        saveDBs(state, { payload: { dbList } }) {
            return {
                ...state,
                dbList,
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