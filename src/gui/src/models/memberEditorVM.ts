import { GetKey, GetRedisEntry, SaveEntry } from "@/services/dbAPI";
import u from "@/u";
import { message } from 'antd';
const _defaultTitle = "Editor";

export default {
    state: {
        redisEntry: {},
        visible: false,
        isNew: false,
        loading: true,
        fieldEditorEnabled: false,
        scoreEditorEnabled: false,
        indexEditorEnabled: false,
        title: _defaultTitle,
    },
    effects: {
        *load(_: any, { put, select }: any): any {
            const state = yield select((x: any) => x["memberEditorVM"]);
            if (!state.Key) {
                return;
            }
            // console.log(state);

            if (state.isNew) {
                // let redisKey: any;
                // if (state.type == u.STRING) {
                //     redisKey = { Key: "", Type: state.type, TTL: -1, };
                // } else {
                //     redisKey = { Key: "", Field: "", Type: state.type, TTL: -1, };
                // }

                // yield put({
                //     type: 'setState', payload: {
                //         loading: false,
                //         redisKey,
                //         value: "",
                //         title: 'new ' + state.type
                //     }
                // });
            } else {
                const redisEntry = yield GetRedisEntry(state);
                yield put({
                    type: 'setState', payload: {
                        redisEntry,
                        loading: false,
                        fieldEditorEnabled: redisEntry.Type == u.HASH,
                        scoreEditorEnabled: redisEntry.Type == u.ZSET,
                        indexEditorEnabled: redisEntry.Type == u.LIST,
                    },
                });
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