import { Effect, Reducer, Subscription } from 'umi';

export interface IRedisEntry {
    Key: string;
    Type: string;
    Field: any;
    Value: string;
    TTL: number;
    Length: number;
    IsNew: boolean;
}

export interface IEntryTableModelState {
    DB: number;                     // current DB
    Entries: IRedisEntry[];         // entries
    [SubEntries: string]: any;
    SelectedRowKeys: string[];      // selected row keys
    SelectedEntries: IRedisEntry[]; // selected entries
}

export interface IEntryTableModel {
    state: IEntryTableModelState;
    effects: {
        fetchEntries: Effect;
    };
    reducers: {
        setState: Reducer<IEntryTableModelState>;
    };
    subscriptions: { setup: Subscription };
}

const EntryTableModel: IEntryTableModel = {
    state: {
        DB: -1,
        Entries: [],
        SelectedRowKeys: [],
        SelectedEntries: [],
    },

    effects: {
        *fetchEntries({ payload }, { call, put }) {
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
        }
    },
};

export default EntryTableModel;