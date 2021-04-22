import { GetMembers } from "@/services/dbAPI";
import u from "@/u";

export default {
    state: {
        keys: [],
        query: u.DefaultQuery,
        hasMore: false,
    },
    effects: {
        *load({ query }: any, { put }: any): any {
            // const resp = yield call(GetKeys, query);
            query = {
                ...u.DefaultQuery,
                ...query,
            };
            const resp = yield GetMembers(query);

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
                console.log("no json in response body");
            }
        },
        *loadMore(_: any, { put, select }: any): any {
            const state = yield select((x: any) => x["keyListVM"]);
            if (!state.hasMore) {
                return;
            }

            const { query } = state;
            // const resp = yield call(GetKeys, query);
            const resp = yield GetMembers(query);

            if (resp?.Keys) {
                query.cursor = resp.Cursor;
                yield put({ type: 'appendKeys', payload: { resp, query } });
            } else {
                console.log("no json in response body");
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
    },
    subscriptions: {
        setup({ dispatch, history }: any) {
            return history.listen(({ pathname }: any) => {
                const regx = /^\/(\w+)\/(\d{1,2})$/;
                const array = regx.exec(pathname);
                if (array?.length == 3) {
                    const query = {
                        ...u.DefaultQuery,
                        serverID: array[1],
                        db: array[2],
                    };
                    const menuKey = query.db.toString();
                    dispatch({
                        type: "menuVM/setState", payload: {
                            // openKeys: [query.nodeID],
                            selectedKeys: [menuKey],
                        }
                    });
                    dispatch({ type: "load", query });
                }
            });
        }
    },
};