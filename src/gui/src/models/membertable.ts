import { Effect, Reducer } from 'umi';

export interface IMemberTableModelState {
    PageSize: number;
}

export interface IMemberTableModel {
    state: IMemberTableModelState;
    reducers: {
        setState: Reducer<IMemberTableModelState>;
    };
}

const EntryTableModel: IMemberTableModel = {
    state: {
        PageSize: 10,
    },
    reducers: {
        setState(state, action) {
            return {
                ...state,
                ...action.payload,
            };
        },
    },
};

export default EntryTableModel;