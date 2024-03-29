import { GetServer } from "@/services/serverAPI";
import u from "@/u";
import { message } from 'antd';

const _defaultState = {
    server: {
        ID: "",
        DBs: [],
    },
    // openKeys: [],
    selectedKeys: [],
};

export default {
    state: _defaultState,
    effects: {
        *getServer({ serverID }: any, { call, put }: any): any {
            const resp = yield call(GetServer, serverID);
            if (u.IsPresent(resp.err)) {
                message.error(resp.err);
                return;
            }
            const dbs = resp.DBs;
            if (!dbs) {
                yield put({ type: 'resetState' });
                return;
            }

            // let selectedNodeID = null;
            // for (let i = 0; i < nodes.length; i++) {
            //     selectedNodeID = nodes[0].ID;
            //     break;
            // }

            yield put({
                type: 'setState',
                payload: {
                    server: resp,
                    // openKeys: [selectedNodeID],
                },
            });
        },
        *init(_: any, { put }: any): any {
            yield put({
                type: 'getServer',
                serverID: "selected",
            });

            // yield put({
            //     type: 'setState',
            //     payload: {
            //         openKeys: ["000"],
            //     },
            // });
        },
        *rebuild(_: any, { put }: any): any {
            yield put({
                type: 'getServer',
                serverID: "selected",
            });

            yield put({
                type: 'setState',
                payload: {
                    // openKeys: ["000"],
                    selectedKeys: [],
                },
            });
        },
    },
    reducers: {
        setState(state: any, { payload }: any) { return { ...state, ...payload }; },
        resetState(state: any) {
            return {
                ...state,
                ..._defaultState,
            };
        },
        // setOpenKeys(state: any, { openKeys }: any) {
        //     if (openKeys.length > 0) {
        //         openKeys = [openKeys[openKeys.length - 1]];
        //     }
        //     return {
        //         ...state,
        //         openKeys,
        //     };
        // },
        // setSelectedKeys(state: any, { selectedKeys }: any) {
        //     return {
        //         ...state,
        //         selectedKeys: selectedKeys,
        //     };
        // },
    },
};