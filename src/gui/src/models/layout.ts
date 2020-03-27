import { Effect, Reducer, Subscription } from 'umi';
import { getDBs, getConfigs } from '@/services/api';
import u from '@/utils/u';

export interface ILayoutModelState {
    DBs: number[];
    Configs: any;
    SelectedDB: number;
}

export interface ILayoutModel {
    namespace: 'layout';
    state: ILayoutModelState;
    effects: {
        load: Effect;
        fetchDBs: Effect;
        fetchConfigs: Effect;
    };
    reducers: {
        saveState: Reducer<ILayoutModelState>;
    };
    subscriptions: { setup: Subscription };
}

const LayoutModel: ILayoutModel = {
    namespace: 'layout',

    state: {
        DBs: [],
        Configs: {},
        SelectedDB: -1,
    },

    effects: {
        *load({ _ }, { call, put }) {
            yield put({ type: 'fetchDBs' });
            yield put({ type: 'fetchConfigs' });
        },
        *fetchDBs({ _ }, { call, put }) {
            const resp = yield call(getDBs);
            yield put({ type: 'saveState', payload: { DBs: resp } });
        },
        *fetchConfigs({ _ }, { call, put }) {
            const resp = yield call(getConfigs);
            yield put({ type: 'saveState', payload: { Configs: resp } });
        },
    },
    reducers: {
        saveState(state, action) {
            return {
                ...state,
                ...action.payload,
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

                dispatch({ type: "saveState", payload: { SelectedDB: selectedDB } });
            });
        }
    },
};

export default LayoutModel;