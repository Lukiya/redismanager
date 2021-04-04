import { GetClusters, RemoveCluster, SaveCluster, SelectCluster } from "@/services/cluster";
const _defaultCluster = {
    ID: "",
    Name: "",
    Addrs: [""],
    Password: "",
};

export default {
    state: {
        clusters: [],
        editingCluster: _defaultCluster,
        editorVisible: false,
    },
    effects: {
        *getClusters(_: any, { call, put }: any): any {
            const resp = yield call(GetClusters);
            yield put({ type: 'setState', payload: { clusters: resp, } });
        },
        *saveCluster({ payload }: any, { call, put }: any): any {
            const addrs = payload.Addrs.split('\n')
            const clusterID = payload.ID;
            const data = {
                ID: clusterID,
                Name: payload.Name,
                Password: payload.Password,
                Addrs: addrs,
            };

            yield call(SaveCluster, data);
            yield put({ type: 'hideEditor' });
            yield put({ type: "getClusters" })
            yield put({ type: 'setState', payload: { editingCluster: _defaultCluster, } });

            yield put({ type: 'menuVM/refresh', clusterID: clusterID ?? "selected" });

        },
        *selectCluster({ payload }: any, { call, put }: any): any {
            yield call(SelectCluster, payload.ID);
            yield put({ type: "getClusters" })

            // refresh left menus
            yield put({ type: "menuVM/getCluster", clusterID: payload.ID });
        },
        *removeCluster({ payload }: any, { call, put }: any): any {
            yield call(RemoveCluster, payload.ID);
            yield put({ type: "getClusters" })
            yield put({ type: 'menuVM/refresh', clusterID: payload.ID });
        },
    },
    reducers: {
        setState(state: any, { payload }: any) { return { ...state, ...payload }; },
        showEditor(state: any, { payload }: any) {
            const editingCluster = payload ?? _defaultCluster;

            return {
                ...state,
                editorVisible: true,
                editingCluster,
            };
        },
        hideEditor(state: any) {
            return {
                ...state,
                editorVisible: false,
            };
        },
    },
    subscriptions: {
        setup({ dispatch, history }: any) {
            return history.listen(({ pathname }: any) => {
                if (pathname == "/") {
                    dispatch({ type: "getClusters" });
                }
            });
        }
    },
};