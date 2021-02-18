import { saveServer } from '@/services/api';
import u from '@/utils/u';
import { Effect, Reducer } from 'umi';


export interface IServerEditorModelState {
    Visible: boolean;
    Editing: any;
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
    },

    effects: {
        *save({ payload }, { call, put, select }) {
            // const state = yield select((x: any) => x["serverEditor"]);
            // console.log(payload);
            const msgCode = yield call(saveServer, payload);
            if (u.isSuccess(msgCode)) {
                yield put({ type: 'hide' });
                yield put({ type: 'layout/load' });
            }
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