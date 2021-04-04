import { GetClusters, RemoveCluster, SaveCluster, SelectCluster } from "@/services/cluster";

export default {
    state: {
        keys: [],
    },
    effects: {
        *getClusters(_: any, { call, put }: any): any {
            const resp = yield call(GetClusters);
            yield put({ type: 'setState', payload: { clusters: resp, } });
        },
    },
    reducers: {
        setState(state: any, { payload }: any) { return { ...state, ...payload }; },
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
};