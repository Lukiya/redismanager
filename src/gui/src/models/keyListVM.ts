import { GetEntries } from "@/services/key";

export default {
    state: {
        pageSize: 10,
        entries: [],
        query: {},
        hasMore: false,
    },
    effects: {
        *getEntries({ query }: any, { call, put, select }: any): any {
            const state = yield select((x: any) => x["keyListVM"]);
            query = {
                ...query,
                cursor: 0,
                pageSize: state.pageSize,
                match: "*",
            };
            const resp = yield call(GetEntries, query);

            if (resp?.Entries) {
                query.cursor = resp.Cursor;
                yield put({ type: 'appendEntries', payload: { resp, query } });
                // yield put({ type: 'setState', payload: { entries: resp.Entries, query, hasMore: resp.Cursor != 0 } });
            } else {
                console.warn("no json in response body");
            }
        },
        *loadMore(_: any, { call, put, select }: any): any {
            const state = yield select((x: any) => x["keyListVM"]);

            const { query } = state;
            const resp = yield call(GetEntries, query);

            if (resp?.Entries) {
                query.cursor = resp.Cursor;
                yield put({ type: 'appendEntries', payload: { resp, query } });
            } else {
                console.warn("no json in response body");
            }
        },
    },
    reducers: {
        setState(state: any, { payload }: any) { return { ...state, ...payload }; },
        appendEntries(state: any, { payload }: any) {
            const { resp, query } = payload;
            return {
                ...state,
                entries: state.entries.concat(resp.Entries),
                hasMore: resp.Cursor != 0,
                query,
            };
        },
        // showEditor(state: any, { payload }: any) {
        //     const editingCluster = payload ?? _defaultCluster;

        //     return {
        //         ...state,
        //         editorVisible: true,
        //         editingCluster,
        //     };
        // },
        // hideEditor(state: any) {
        //     return {
        //         ...state,
        //         editorVisible: false,
        //     };
        // },
    },
    subscriptions: {
        setup({ dispatch, history }: any) {
            return history.listen(({ pathname }: any) => {
                const regx = /^\/(\w+)\/(\d{3})\/db(\d{1,2})$/;
                const array = regx.exec(pathname);
                if (array?.length == 4) {
                    dispatch({
                        type: "getEntries", query: {
                            clusterID: array[1],
                            nodeID: array[2],
                            db: array[3],
                        }
                    });
                }
            });
        }
    },
};