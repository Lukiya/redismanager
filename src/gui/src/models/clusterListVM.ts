import { GetClusters, SaveCluster } from "@/services/cluster";
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
            yield put({
                type: 'setState',
                payload: {
                    clusters: resp,
                },
            });
        },
        *saveCluster({ payload }: any, { call, put }: any): any {
            const addrs = payload.Addrs.split('\n')
            const data = {
                ID: payload.ID ?? "",
                Name: payload.Name,
                Password: payload.Password,
                Addrs: addrs,
            };
            // console.log(data);
            const resp = yield call(SaveCluster, data);
            console.log(resp);
        },
    },
    reducers: {
        setState(state: any, { payload }: any) { return { ...state, ...payload }; },
        showEditor(state: any, { payload }: any) {
            const editingCluster = payload ?? _defaultCluster;
            console.log(editingCluster);

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