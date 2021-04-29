import { GetKey, Scan, SaveEntry, DeleteEntries, GetRedisEntry } from "@/services/dbAPI";
import u from "@/u";
import { message } from 'antd';

export default {
    state: {
        // ...u.DefaultQuery,
        redisKey: {},
        query: u.DefaultQuery,
        dataSource: [],
        selectedRowKeys: [],
        selectedEntries: [],
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
        *save({ values }: any, { put, select }: any): any {
            const state = yield select((x: any) => x["memberListVM"]);
            const data = {
                new: values,
                old: state.redisKey,
                isNew: false,
            }

            const resp = yield SaveEntry(state, data);
            if (!resp?.err) {
                yield put({ type: "hide" });
                yield put({
                    type: "keyListVM/updateKey", payload: {
                        n: data.new,
                        o: data.old,
                    }
                });
            }
        },
        *deleteElements(_: any, { put, select }: any): any {
            const state = yield select((x: any) => x["memberListVM"]);
            const { redisKey, selectedEntries, query, dataSource } = state;
            if (selectedEntries.length == 0) return;

            const commands = state.selectedEntries.map((v: any) => {
                let elementKey: any;

                switch (redisKey.Type) {
                    case u.HASH:
                        elementKey = v.Key;
                        break;
                    case u.LIST:
                        elementKey = v.Value;
                        break;
                    case u.SET:
                        elementKey = v.Value;
                        break;
                    case u.ZSET:
                        elementKey = v.Value;
                        break;
                }

                return {
                    Key: redisKey.Key,
                    ElementKey: elementKey,
                }
            });

            const resp = yield DeleteEntries(query, {
                Commands: commands,
            });
            if (!resp) {
                const newDataSource = dataSource.filter((x: any) => !selectedEntries.includes(x));  // remove deleted entries from table current data source

                yield put({
                    type: 'setState', payload: {
                        dataSource: newDataSource,
                        selectedRowKeys: [],
                        selectedEntries: [],
                    }
                });

                yield put({
                    type: "keyListVM/updateKey", payload: {
                        n: redisKey,
                        o: redisKey,
                    }
                });
            }
        },
        *updateElement({ payload }: any, { put, select }: any): any {
            const state = yield select((x: any) => x["memberListVM"]);
            // const { query } = state;
            const { n, o } = payload;

            let newElemKey: any, oldElemKey: any;

            switch (n.Type) {
                case u.HASH:
                    newElemKey = n.Field;
                    oldElemKey = o.Field;
                    break;
                default:
                    newElemKey = n.Value;
                    oldElemKey = o.Value;
                    break;
            }

            // query.redisKey = n;
            const query = {
                ServerID: state.query.serverID,
                DB: state.query.db,
                Key: state.redisKey.Key,
                ElemKey: newElemKey,
            };
            const newEntry = yield GetRedisEntry(query);
            if (newEntry) {
                const newSource = state.dataSource.filter((v: any) => v.Key != oldElemKey); // remove old entry

                if (newEntry.Type != u.NONE) {
                    newSource.push(u.EntryToElement(newEntry)); // add new entry
                }

                yield put({
                    type: 'setState', payload: {
                        dataSource: newSource,
                    }
                });
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
                selectedRowKeys: [],
                selectedEntries: [],
                query: u.DefaultQuery,
                hasMore: false,
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