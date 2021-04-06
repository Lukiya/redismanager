import { GetServers, RemoveServer, SaveServer, SelectServer } from "@/services/server";
const _defaultServer = {
    ID: "",
    Name: "",
    Addrs: [""],
    Password: "",
};

export default {
    state: {
        servers: [],
        editingServer: _defaultServer,
        editorVisible: false,
    },
    effects: {
        *getServers(_: any, { call, put }: any): any {
            const resp = yield call(GetServers);
            yield put({ type: 'setState', payload: { servers: resp, } });
        },
        *saveServer({ payload }: any, { call, put }: any): any {
            const addrs = payload.Addrs.split('\n')
            const data = {
                ID: payload.ID,
                Name: payload.Name,
                Password: payload.Password,
                Addrs: addrs,
            };

            yield call(SaveServer, data);
            yield put({ type: 'hideEditor' });
            yield put({ type: "getServers" })
            yield put({ type: 'setState', payload: { editingServer: _defaultServer, } });

            if (payload.ID == "" || payload.Selected) { // if it's new or selected server, re-build menu after save
                yield put({ type: 'menuVM/rebuild' });
            }
        },
        *selectServer({ payload }: any, { call, put }: any): any {
            yield call(SelectServer, payload.ID);
            yield put({ type: "getServers" })

            yield put({ type: 'menuVM/rebuild' });
        },
        *removeServer({ server }: any, { call, put }: any): any {
            yield call(RemoveServer, server.ID);
            yield put({ type: "getServers" })
            if (server.Selected) {
                yield put({ type: 'menuVM/rebuild' });
            }
        },
    },
    reducers: {
        setState(state: any, { payload }: any) { return { ...state, ...payload }; },
        showEditor(state: any, { payload }: any) {
            const editingServer = payload ?? _defaultServer;

            return {
                ...state,
                editorVisible: true,
                editingServer,
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
                    dispatch({
                        type: "menuVM/setState", payload: {
                            openKeys: [],
                            selectedKeys: [],
                        }
                    });

                    dispatch({ type: "getServers" });
                }
            });
        }
    },
};