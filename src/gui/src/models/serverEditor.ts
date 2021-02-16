import { Effect, Reducer } from 'umi';


export interface IServerEditorModelState {
    Visible: boolean;
    Editing: any;
    Backup: any;
}

export interface IServerEditorModel {
    state: IServerEditorModelState;
    effects: {
        save: Effect;
    };
    reducers: {
        setState: Reducer<IServerEditorModelState>;
        show: Reducer<IServerEditorModelState>;
        hide: Reducer<IServerEditorModelState>;
    };
}

const ServerEditorModel: IServerEditorModel = {
    state: {
        Visible: false,
        Editing: {},
        Backup: {},
    },

    effects: {
        *save({ _ }, { call, put, select }) {
            // const state = yield select((x: any) => x["editor"]);

            // const msgCode = yield call(saveEntry, state.DB, state.EditingEntry, state.BackupEntry);

            // if (u.isSuccess(msgCode)) {
            //     yield put({ type: 'hide' });
            //     yield put({ type: 'keytable/refreshEntry', payload: { EditingKey: state.EditingEntry.Key, BackupKey: state.BackupEntry.Key } });
            // }
        },
    },
    reducers: {
        setState(state, { payload }) {
            return {
                ...state,
                ...payload,
            };
        },
        show(state: any, { payload }) {
            return {
                ...state,
                Editing: payload.Server,
                Backup: payload.Server,
                Visible: true,
            };
        },
        hide(state: any) {
            return {
                ...state,
                Visible: false,
            };
        },
    },
};

export default ServerEditorModel;