import { GetKey, GetValue } from "@/services/key";
import u from "@/u";

const _defaultState = {
    redisKey: {},
    visible: false,
    isNew: false,
    canBeautify: false,
};

export default {
    state: _defaultState,
    effects: {
        *show({ payload }: any, { put }: any): any {
            if (payload.isNew) {

            } else {
                const keyResp = yield GetKey(payload);
                if (keyResp?.Key) {
                    if (keyResp.Type == u.STRING) {
                        const valueResp = yield GetValue(payload);
                        yield put({ type: 'setState', payload: { redisKey: keyResp, visible: true, value: valueResp, isNew: false, }, });
                    } else {
                        yield put({ type: 'setState', payload: { redisKey: keyResp, visible: true, value: undefined, isNew: false, }, });
                    }
                } else {
                    console.warn(keyResp);
                }
            }
        },
        *save({ values }: any, { put, select }: any): any {
            // const state = yield select((x: any) => x["memberEditorVM"]);
            // console.log(values, state);
            console.log(values);
        },
    },
    reducers: {
        setState(state: any, { payload }: any) { return { ...state, ...payload }; },
        hide(state: any) {
            return {
                ...state,
                visible: false,
            };
        },
    },
};