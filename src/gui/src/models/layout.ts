import { Effect, Reducer, Subscription } from 'umi';
import { getDBs, getConfigs } from '@/services/api';

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
        setState: Reducer<ILayoutModelState>;
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
            yield put({ type: 'setState', payload: { DBs: resp } });
        },
        *fetchConfigs({ _ }, { call, put }) {
            const resp = yield call(getConfigs);
            yield put({ type: 'setState', payload: { Configs: resp } });
        },
    },
    reducers: {
        setState(state, action) {
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

                dispatch({ type: "setState", payload: { SelectedDB: selectedDB } });
            });
        }
    },
};

export default LayoutModel;