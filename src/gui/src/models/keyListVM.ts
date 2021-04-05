import { GetEntries } from "@/services/key";

export default {
    state: {
        cursor: 0,
        entries: [],
    },
    effects: {
        *getEntries({ query }: any, { call, put, select }: any): any {
            const state = yield select((x: any) => x["keyListVM"]);

            query = {
                ...query,
                cursor: state.cursor,
                pageSize: 20,
                match: "*",
            };
            const resp = yield call(GetEntries, query);

            if (resp?.Entries) {
                yield put({ type: 'setState', payload: { cursor: resp.Cursor, entries: resp.Entries, } });
            } else {
                console.warn("no json in response body");
            }
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