import { DeleteEntries, ExportKeys, GetKey, Scan, ImportKeys } from "@/services/dbAPI";
import u from "@/u";
import { message } from 'antd';

export default {
    state: {
        keys: [],
        selectedRowKeys: [],
        selectedEntries: [],
        query: u.DefaultQuery,
        hasMore: false,
        cursors: {},
        pageSize: -1,
        suggestedPageSize: 10,
    },
    effects: {
        // *load({ query }: any, { put, select }: any): any {
        *load({ query }: any, { put }: any): any {
            // const resp = yield call(GetKeys, query);
            query = {
                ...u.DefaultQuery,
                ...query,
            };
            const resp = yield Scan(query);
            if (u.IsPresent(resp.err)) {
                message.error(resp.err);
            } else if (resp?.Keys && resp?.Cursors) {
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
            // const state = yield select((x: any) => x["keyListVM"]);
            // console.log(state.query);
        },
        *loadMore(_: any, { put, select }: any): any {
            const state = yield select((x: any) => x["keyListVM"]);
            if (!state.hasMore) {
                return;
            }

            const { query } = state;
            const resp = yield Scan(query);

            if (u.IsPresent(resp.err)) {
                message.error(resp.err);
            } else if (resp?.Keys && resp?.Cursors) {
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

            if (u.IsPresent(resp.err)) {
                message.error(resp.err);
            } else if (resp?.Keys && resp?.Cursors) {
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
        *deleteKeys(_: any, { put, select }: any): any {
            const state = yield select((x: any) => x["keyListVM"]);
            if (state.selectedEntries.length == 0) return;

            const commands = state.selectedEntries.map((v: any) => {
                return {
                    Key: v.Key,
                    ElementKey: "",
                }
            });

            const { query } = state;
            const resp = yield DeleteEntries(query, {
                Commands: commands,
            });


            if (!resp) {
                const newKeys = state.keys.filter((x: any) => !state.selectedEntries.includes(x));  // remove deleted keys from table current data source

                yield put({
                    type: 'setState', payload: {
                        keys: newKeys,
                        selectedRowKeys: [],
                        selectedEntries: [],
                    }
                });
            }
        },
        *updateKey({ payload }: any, { put, select }: any): any {
            const state = yield select((x: any) => x["keyListVM"]);
            const { query } = state;
            const { n, o } = payload;

            query.redisKey = n;
            const newEntry = yield GetKey(query);
            if (newEntry) {
                const newKeys = state.keys.filter((v: any) => v.Key != o.Key); // remove old entry

                if (newEntry.Type != u.NONE) {
                    newKeys.push(newEntry); // add new entry
                }

                yield put({
                    type: 'setState', payload: {
                        keys: newKeys,
                    }
                });
            }
        },
        *copy(_: any, { put, select }: any): any {
            const state = yield select((x: any) => x["keyListVM"]);
            if (state.selectedRowKeys.length === 0) {
                return;
            }

            const resp = yield ExportKeys(state.query, state.selectedRowKeys);
            if (!resp.MsgCode) {
                u.CopyToClipboard(resp.Data);
                yield put({
                    type: 'setState', payload: {
                        selectedRowKeys: [],
                        selectedEntries: [],
                    }
                });
                message.info(state.selectedRowKeys.length + " key(s) copied.");
            } else {
                message.error(resp.MsgCode);
            }
        },
        *paste({ clipboardText }: any, { put, select }: any): any {
            const base64Str = clipboardText.substring(u.CLIPBOARD_REDIS.length, clipboardText.length);
            let bytes;
            try {
                bytes = u.Base64ToBytes(base64Str);
            } catch (err) {
                message.error(err);
                return;
            }

            const state = yield select((x: any) => x["keyListVM"]);
            const resp = yield ImportKeys(state.query, bytes);
            if (!resp.MsgCode) {
                message.success(resp.Data + " key(s) pasted.");
            } else {
                message.error(resp.MsgCode);
            }
            yield put({ type: 'load', query: state.query });   // Refresh
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
        // updateKey(state: any, { payload }: any) {
        //     const n = payload.new;
        //     const o = payload.old;

        //     let found = false;
        //     for (const i in state.keys) {
        //         const x = state.keys[i];
        //         if (x.Key == o.Key) {
        //             found = true;
        //             state.keys.splice(i, 1, n);     // replace old entry with new entry
        //             return {
        //                 ...state,
        //                 keys: state.keys.concat(),  // use contact to clone a new array to foce table refresh
        //             };
        //         }
        //     }

        //     if (!found) {
        //         state.keys.push(n);                 // not exists in data source, add
        //         return {
        //             ...state,
        //             keys: state.keys.concat(),      // use contact to clone a new array to foce table refresh
        //         };
        //     }
        // }
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