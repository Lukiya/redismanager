import { GetKey, GetValue, SaveEntry } from "@/services/dbAPI";
import u from "@/u";
import { message } from 'antd';
const _defaultTitle = "Editor";

export default {
    state: {
        redisKey: {},
        visible: false,
        isNew: false,
        loading: true,
        title: _defaultTitle,
    },
    effects: {
        *load(_: any, { put, select }: any): any {
            const state = yield select((x: any) => x["memberEditorVM"]);
            // console.log(state);

            if (state.isNew) {
                let redisKey: any;
                if (state.type == u.STRING) {
                    redisKey = { Key: "", Type: state.type, TTL: -1, };
                } else {
                    redisKey = { Key: "", Field: "", Type: state.type, TTL: -1, };
                }

                yield put({
                    type: 'setState', payload: {
                        loading: false,
                        redisKey,
                        value: "",
                        title: 'new ' + state.type
                    }
                });
            } else {
                const redisKey = yield GetKey(state);
                if (redisKey?.Key) {
                    const valueResp = yield GetValue(state);
                    yield put({
                        type: 'setState', payload: {
                            redisKey: redisKey,
                            // visible: true,
                            value: valueResp,
                            isNew: false,
                            loading: false,
                        },
                    });
                } else {
                    console.warn(redisKey);
                    yield put({ type: 'setState', payload: { loading: false }, });
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
                isNew: state.isNew,
            }

            const resp = yield SaveEntry(state, data);
            if (resp?.err) {
                message.error(resp.err);
            }
        },
    },
    reducers: {
        setState(state: any, { payload }: any) { return { ...state, ...payload }; },
        show(state: any, { payload }: any,) {
            return {
                ...state,
                ...payload,
                // key: payload.redisKey.Key,
                loading: true,
                visible: true,
                title: _defaultTitle,
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