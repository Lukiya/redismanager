import { Effect, Reducer } from 'umi';
import { importFile } from '@/services/api';

export interface IImporterModelState {
}

export interface IImporterModel {
    state: IImporterModelState;
    effects: {
        uploadFile: Effect;
    };
    reducers: {
        handleMsgCode: Reducer;
    };
}

const ImporterModel: IImporterModel = {
    state: {},
    effects: {
        *uploadFile({ db, data, options }, { call, put }) {
            const msgCode = yield call(importFile, db, data);
            yield put({ type: 'handleMsgCode', payload: { msgCode, options } });
            yield put({ type: 'keytable/fetchEntries', payload: { DB: db } });   // Refresh
        },
    },
    reducers: {
        handleMsgCode(state, { payload: { msgCode, options } }) {
            if (msgCode === "") {
                options.onSuccess();
            } else {
                options.onError();
            }

            return state;
        },
    },
};

export default ImporterModel;