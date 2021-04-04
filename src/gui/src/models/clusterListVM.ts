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
            const data = {
                ID: payload.ID,
                Name: payload.Name,
                Password: payload.Password,
                Addrs: addrs,
            };

            yield call(SaveCluster, data);
            yield put({ type: 'hideEditor' });
            yield put({ type: "getClusters" })
            yield put({ type: 'setState', payload: { editingCluster: _defaultCluster, } });

            if (payload.ID == "" || payload.Selected) { // if it's new or selected cluster, re-build menu after save
                yield put({ type: 'menuVM/build' });
            }
        },
        *selectCluster({ payload }: any, { call, put }: any): any {
            yield call(SelectCluster, payload.ID);
            yield put({ type: "getClusters" })

            yield put({ type: 'menuVM/build' });
        },
        *removeCluster({ cluster }: any, { call, put }: any): any {
            yield call(RemoveCluster, cluster.ID);
            yield put({ type: "getClusters" })
            if (cluster.Selected) {
                yield put({ type: 'menuVM/build' });
            }
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