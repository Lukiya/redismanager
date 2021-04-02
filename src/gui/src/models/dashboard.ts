import { GetClusters } from "@/services/cluster";

export default {
    state: {
        servers: [],
    },
    effects: {
        *getClusters(_: any, { call, put }: any): any {
            const resp = yield call(GetClusters);
            yield put({
                type: 'setState',
                payload: {
                    servers: resp.Results,
                },
            });
        },
    },
    reducers: {
        setState(state: any, { payload }: any) { return { ...state, ...payload }; },
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