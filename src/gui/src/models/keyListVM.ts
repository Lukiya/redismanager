import { Scan } from "@/services/dbAPI";
import u from "@/u";

export default {
    state: {
        keys: [],
        query: u.DefaultQuery,
        hasMore: false,
        cursors: {},
        pageSize: -1,
        suggestedPageSize: 10,
    },
    effects: {
        *load({ query }: any, { put }: any): any {
            // const resp = yield call(GetKeys, query);
            query = {
                ...u.DefaultQuery,
                ...query,
            };
            const resp = yield Scan(query);

            if (resp?.Keys && resp?.Cursors) {
                query.cursors = resp.Cursors;
                const curs = Object.keys(resp.Cursors);
                yield put({
                    type: 'setState', payload: {
                        keys: resp.Keys,
                        query,
                        hasMore: curs.length > 0,
                        suggestedPageSize: u.GetPageSize(),
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
            const resp = yield Scan(query);

            if (resp?.Keys && resp?.Cursors) {
                query.cursors = resp.Cursors;
                yield put({
                    type: 'appendKeys', payload: {
                        resp,
                        query,
                        suggestedPageSize: u.GetPageSize(),
                    }
                });
            } else {
                console.log("no json in response body");
            }
        },
        *loadAll(_: any, { put, select }: any): any {
            const state = yield select((x: any) => x["keyListVM"]);
            if (!state.hasMore) {
                return;
            }

            const { query } = state;
            query.all = true;
            const resp = yield Scan(query);

            if (resp?.Keys && resp?.Cursors) {
                query.cursors = resp.Cursors;
                yield put({
                    type: 'setState', payload: {
                        keys: resp.Keys,
                        query,
                        hasMore: false,
                        suggestedPageSize: u.GetPageSize(),
                    }
                });
            } else {
                console.log("no json in response body");
            }
        },
    },
    reducers: {
        setState(state: any, { payload }: any) { return { ...state, ...payload }; },
        appendKeys(state: any, { payload }: any) {
            const { resp, query, suggestedPageSize } = payload;
            const curs = Object.keys(resp.Cursors);
            return {
                ...state,
                keys: state.keys.concat(resp.Keys),
                hasMore: curs.length > 0,
                suggestedPageSize,
                query,
            };
        },
        setPageSize(state: any, { pageSize }: any) {
            return {
                ...state,
                pageSize,
            };
        },
        removeKey(state: any) {
            return state;
        },
        updateKey(state: any, { payload }: any) {
            const n = payload.new;
            const o = payload.old;

            let found = false;
            for (const i in state.keys) {
                const x = state.keys[i];
                if (x.Key == o.Key) {
                    found = true;
                    state.keys.splice(i, 1, n);     // replace old entry with new entry
                    return {
                        ...state,
                        keys: state.keys.concat(),  // use contact to clone a new array to foce table refresh
                    };
                }
            }

            if (!found) {
                state.keys.push(n);                 // not exists in data source, add
                return {
                    ...state,
                    keys: state.keys.concat(),      // use contact to clone a new array to foce table refresh
                };
            }
        }
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