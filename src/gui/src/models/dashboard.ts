import { GetServers } from "@/services/api";

export default {
    state: {
        servers: [],
    },
    effects: {
        *getServers(_: any, { call, put }: any): any {
            const resp = yield call(GetServers);
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
                    dispatch({ type: "getServers" });
                }
            });
        }
    },
};