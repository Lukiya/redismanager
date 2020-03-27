import { Effect, Reducer } from 'umi';

export interface IDashboardModelState {
    name: string;
}

export interface IDashboardModel {
    namespace: 'dashboard';
    state: IDashboardModelState;
    effects: {
        query: Effect;
    };
    reducers: {
        save: Reducer<IDashboardModelState>;
    };
}

const DashboardModel: IDashboardModel = {
    namespace: 'dashboard',

    state: {
        name: 'dashboard AAAAA',
    },

    effects: {
        *query({ payload }, { call, put }) {
        },
    },
    reducers: {
        save(state, action) {
            return {
                ...state,
                ...action.payload,
            };
        },
    },
};

export default DashboardModel;