import { GetCluster } from "@/services/cluster";

const _defaultState = {
    cluster: {
        ID: "",
        Nodes: [],
    },
    openKeys: [],
};

export default {
    state: _defaultState,
    effects: {
        *getCluster({ clusterID }: any, { call, put }: any): any {
            const resp = yield call(GetCluster, clusterID);
            const nodes = resp.Nodes;
            if (!nodes) {
                yield put({ type: 'resetState' });
                return;
            }

            let selectedNodeID = null;
            for (let i = 0; i < nodes.length; i++) {
                selectedNodeID = nodes[0].ID;
                break;
            }

            yield put({
                type: 'setState',
                payload: {
                    cluster: resp,
                    openKeys: [selectedNodeID],
                },
            });
        },
        *build(_: any, { put, select }: any): any {
            yield put({
                type: 'getCluster',
                clusterID: "selected",
            });

            // const state = yield select((x: any) => x["menuVM"]);



            // if (clusterID == "selected" || state.cluster.ID == clusterID) {
            //     yield put({
            //         type: 'getCluster',
            //         clusterID,
            //     });
            // }
        },
    },
    reducers: {
        setState(state: any, { payload }: any) { return { ...state, ...payload }; },
        resetState(state: any, { payload }: any) {
            return {
                ...state,
                ..._defaultState,
            };
        },
        setOpenKeys(state: any, { openKeys }: any) {
            if (openKeys.length > 0) {
                openKeys = [openKeys[openKeys.length - 1]];
            }
            return {
                ...state,
                openKeys,
            };
        },
    },
};