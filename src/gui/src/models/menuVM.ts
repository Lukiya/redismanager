import { GetCluster } from "@/services/cluster";

export default {
    state: {
        cluster: {},
        openKeys: [],
    },
    effects: {
        *GetCluster({ clusterID }: any, { call, put }: any): any {
            const resp = yield call(GetCluster, clusterID);
            let selectedNodeID = null;
            for (let i = 0; i < resp.Nodes.length; i++) {
                selectedNodeID = resp.Nodes[0].ID;
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
    },
    reducers: {
        setState(state: any, { payload }: any) { return { ...state, ...payload }; },
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