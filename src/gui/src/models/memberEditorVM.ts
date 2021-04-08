import { GetKey, GetValue, SaveEntry } from "@/services/key";
import u from "@/u";

export default {
    state: {
        redisKey: {},
        visible: false,
        isNew: false,
        canBeautify: false,
    },
    effects: {
        *load(_: any, { put, select }: any): any {
            const state = yield select((x: any) => x["memberEditorVM"]);
            if (state.isNew) {

            } else {
                const keyResp = yield GetKey(state);
                if (keyResp?.Key) {
                    if (keyResp.Type == u.STRING) {
                        const valueResp = yield GetValue(state);
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
            const state = yield select((x: any) => x["memberEditorVM"]);
            // console.log(values, state);
            // console.log(state.redisKey);
            // console.log(values);
            const data = {
                new: values,
                old: state.redisKey,
            }

           const resp =  yield SaveEntry(state, data);
        },
    },
    reducers: {
        setState(state: any, { payload }: any) { return { ...state, ...payload }; },
        show(state: any, { payload }: any,) {
            return {
                ...state,
                ...payload,
                visible: true,
            };
        },
        hide(state: any) {
            return {
                ...state,
                visible: false,
            };
        },
    },
};