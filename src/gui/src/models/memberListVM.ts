import { GetKey, Scan, SaveEntry } from "@/services/dbAPI";
import u from "@/u";
import { message } from 'antd';

export default {
    state: {
        // ...u.DefaultQuery,
        redisKey: {},
        query: u.DefaultQuery,
        dataSource: [],
        // loading: true,
        hasMore: false,
        visible: false,
        pageSize: -1,
        suggestedPageSize: 10,
    },
    effects: {
        *load({ query }: any, { put }: any): any {
            query = {
                ...u.DefaultQuery,
                ...query,
            };
            // const state = yield select((x: any) => x["memberListVM"]);
            const kResp = yield GetKey(query);
            if (kResp?.Key) {
                query.redisKey = kResp;
                const eResp = yield Scan(query);
                if (eResp?.Elements) {
                    query.cursor = eResp.Cursor;
                    yield put({
                        type: "setState", payload: {
                            query,
                            redisKey: query.redisKey,
                            dataSource: eResp.Elements,
                            hasMore: query.cursor != 0,
                            suggestedPageSize: u.GetPageSize(),
                        }
                    });
                }
            } else {
                console.log("no json in response body");
            }
        },
        *loadMore(_: any, { put, select }: any): any {
            const state = yield select((x: any) => x["memberListVM"]);
            if (!state.hasMore) {
                return;
            }
            const { query } = state;

            const resp = yield Scan(query);
            if (resp?.Elements) {
                query.cursor = resp.Cursor;
                yield put({
                    type: 'appendElements',
                    payload: {
                        query,
                        elements: resp.Elements,
                        hasMore: query.cursor != 0,
                        suggestedPageSize: u.GetPageSize(),
                    },
                });
            } else {
                console.log("no json in response body");
            }
        },
        *loadAll(_: any, { put, select }: any): any {
            const state = yield select((x: any) => x["memberListVM"]);
            if (!state.hasMore) {
                return;
            }

            const { query } = state;
            query.all = true;

            const resp = yield Scan(query);
            query.cursor = 0;
            if (resp?.Elements) {
                yield put({
                    type: 'setState',
                    payload: {
                        dataSource: resp.Elements,
                        query,
                        hasMore: false,
                        suggestedPageSize: u.GetPageSize(),
                    },
                });
            } else {
                console.log("no json in response body");
            }
        },
        *save({ values }: any, { select }: any): any {
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
        appendElements(state: any, { payload }: any) {
            const { elements, suggestedPageSize, query, hasMore } = payload;
            return {
                ...state,
                query,
                hasMore,
                // loading: false,
                dataSource: state.dataSource.concat(elements),
                suggestedPageSize,
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
        setPageSize(state: any, { pageSize }: any) {
            return {
                ...state,
                pageSize,
            };
        },
    },
};