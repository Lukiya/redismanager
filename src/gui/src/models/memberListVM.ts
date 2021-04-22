import { GetKey, GetMembers, SaveEntry } from "@/services/dbAPI";
import u from "@/u";
import { message } from 'antd';

export default {
    state: {
        ...u.DefaultQuery,
        redisKey: {},
        dataSource: [],
        // loading: true,
        hasMore: false,
        visible: false,
    },
    effects: {
        *load(_: any, { put, select }: any): any {
            const state = yield select((x: any) => x["memberListVM"]);
            const kResp = yield GetKey(state);
            if (kResp?.Key) {
                const mResp = yield GetMembers(state);
                if (mResp?.Members) {
                    yield put({
                        type: "setState", payload: {
                            redisKey: kResp,
                            dataSource: mResp.Members,
                            cursor: mResp.Cursor,
                            hasMore: mResp.Cursor != 0,
                        }
                    });
                }
            } else {
                console.warn("no json in response body");
            }
        },
        *loadMore(_: any, { put, select }: any): any {
            const state = yield select((x: any) => x["memberListVM"]);
            if (!state.hasMore) {
                return;
            }

            const resp = yield GetMembers(state);
            if (resp?.Members) {
                yield put({ type: 'appendMembers', resp });
            } else {
                console.warn("no json in response body");
            }
        },
        *save({ values }: any, { put, select }: any): any {
            const state = yield select((x: any) => x["memberListVM"]);
            const data = {
                new: values,
                old: state.redisKey,
                isNew: false,
            }

            const resp = yield SaveEntry(state, data);
            if (resp?.err) {
                message.error(resp.err);
            }
        },
    },
    reducers: {
        setState(state: any, { payload }: any) { return { ...state, ...payload }; },
        appendMembers(state: any, { resp }: any) {
            return {
                ...state,
                // loading: false,
                dataSource: state.dataSource.concat(resp.Members),
                cursor: resp.Cursor,
                hasMore: resp.Cursor != 0,
            };
        },
        show(state: any, { payload }: any,) {
            return {
                ...state,
                ...payload,
                // key: payload.redisKey.Key,
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