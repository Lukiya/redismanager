import { Effect, Reducer, Subscription, history } from 'umi';
import { getDBs, selectServer, getServers } from '@/services/api';

export interface ILayoutModelState {
    DBs: number[];
    Servers: any[];
    // Configs: any;
    SelectedDB: number;
    EditorVisible: boolean;
}

export interface ILayoutModel {
    namespace: 'layout';
    state: ILayoutModelState;
    effects: {
        load: Effect;
        selectServer: Effect;
        // fetchDBs: Effect;
        // fetchConfigs: Effect;
        // fetchServers: Effect;
    };
    reducers: {
        setState: Reducer<ILayoutModelState>;
        show: Reducer<ILayoutModelState>;
        hide: Reducer<ILayoutModelState>;
    };
    subscriptions: { setup: Subscription };
}

const LayoutModel: ILayoutModel = {
    namespace: 'layout',

    state: {
        DBs: [],
        Servers: [],
        // Configs: {},
        SelectedDB: -1,
        EditorVisible: false,
    },

    effects: {
        *load({ _ }, { call, put }) {
            const dbs = yield call(getDBs);
            const servers = yield call(getServers);
            yield put({ type: 'setState', payload: { DBs: dbs, Servers: servers, SelectedDB: -1 } });
            // yield put({ type: 'fetchDBs' });
            // yield put({ type: 'fetchConfigs' });
            // yield put({ type: 'fetchServers' });
        },
        *selectServer({ payload }, { call, put }) {
            yield call(selectServer, payload.ID);
            yield put({ type: 'load' });
            history.push('/');
        },
        // *fetchDBs({ _ }, { call, put }) {
        //     const resp = yield call(getDBs);
        //     yield put({ type: 'setState', payload: { DBs: resp } });
        // },
        // *fetchConfigs({ _ }, { call, put }) {
        //     const resp = yield call(getConfigs);
        //     yield put({ type: 'setState', payload: { Configs: resp } });
        // },
        // *fetchServers({ _ }, { call, put }) {
        //     const resp = yield call(getServers);
        //     yield put({ type: 'setState', payload: { Servers: resp } });
        // },
    },
    reducers: {
        setState(state, action) {
            return {
                ...state,
                ...action.payload,
            };
        },
        show(state: any, { payload }) {
            return {
                ...state,
                EditorVisible: true,
            };
        },
        hide(state: any) {
            return {
                ...state,
                EditorVisible: false,
            };
        },
    },
    subscriptions: {
        setup({ dispatch, history }) {
            return history.listen(({ pathname }) => {
                let selectedDB = -1;
                var t = pathname.match(/^\/db\/(\d+)$/);
                if (t !== null && t.length > 1) {
                    selectedDB = parseInt(t[1]);
                }

                dispatch({ type: "setState", payload: { SelectedDB: selectedDB } });
            });
        }
    },
};

export default LayoutModel;