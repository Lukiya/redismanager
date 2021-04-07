import { GetKeys } from "@/services/key";

const _defaultCount = 50;

export default {
    state: {
        keys: [],
        query: {
            serverID: "",
            nodeID: "",
            db: 0,
            cursor: 0,
            count: _defaultCount,
            match: "",
        },
        hasMore: false,
    },
    effects: {
        *getKeys({ query }: any, { call, put }: any): any {
            query = {
                ...query,
                cursor: 0,
                count: _defaultCount,
            };
            const resp = yield call(GetKeys, query);

            if (resp?.Keys) {
                query.cursor = resp.Cursor;
                yield put({
                    type: 'setState', payload: {
                        keys: resp.Keys,
                        query,
                        hasMore: resp.Cursor != 0,
                    }
                });
            } else {
                console.warn("no json in response body");
            }
        },
        *loadMore(_: any, { call, put, select }: any): any {
            const state = yield select((x: any) => x["keyListVM"]);
            if (!state.hasMore) {
                return;
            }

            const { query } = state;
            const resp = yield call(GetKeys, query);

            if (resp?.Keys) {
                query.cursor = resp.Cursor;
                yield put({ type: 'appendKeys', payload: { resp, query } });
            } else {
                console.warn("no json in response body");
            }
        },
    },
    reducers: {
        setState(state: any, { payload }: any) { return { ...state, ...payload }; },
        appendKeys(state: any, { payload }: any) {
            const { resp, query } = payload;
            return {
                ...state,
                keys: state.keys.concat(resp.Keys),
                hasMore: resp.Cursor != 0,
                query,
            };
        },
        // showEditor(state: any, { payload }: any) {
        //     const editingServer = payload ?? _defaultServer;

        //     return {
        //         ...state,
        //         editorVisible: true,
        //         editingServer,
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
                    const query = {
                        serverID: array[1],
                        nodeID: array[2],
                        db: array[3],
                    };
                    const menuKey = query.serverID + "_" + query.nodeID + "_" + query.db;
                    dispatch({
                        type: "menuVM/setState", payload: {
                            openKeys: [query.nodeID],
                            selectedKeys: [menuKey],
                        }
                    });
                    dispatch({ type: "getKeys", query });
                }
            });
        }
    },
};