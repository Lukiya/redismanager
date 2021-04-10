import { GetMembers } from "@/services/dbAPI";
import u from "@/u";

export default {
    state: {
        ...u.DefaultQuery,
        dataSource: [],
        loading: true,
        hasMore: false,
    },
    effects: {
        *load({ payload }: any, { put, select }: any): any {
            payload = {
                ...u.DefaultQuery,
                ...payload,
            };
            const resp = yield GetMembers(payload);
            if (resp?.Members) {
                payload.loading = false;
                payload.dataSource = resp.Members;
                payload.cursor = resp.Cursor;
                payload.hasMore = resp.Cursor != 0;
                yield put({ type: "setState", payload });
            } else {
                console.warn("no json in response body");
            }
        },
        *loadMore(_: any, { put, select }: any): any {
            const state = yield select((x: any) => x["memberListVM"]);
            if (!state.hasMore) {
                return;
            }

            const resp = yield GetMembers(state);
            if (resp?.Members) {
                yield put({ type: 'appendMembers', resp });
            } else {
                console.warn("no json in response body");
            }
        },
    },
    reducers: {
        setState(state: any, { payload }: any) { return { ...state, ...payload }; },
        appendMembers(state: any, { resp }: any) {
            return {
                ...state,
                loading: false,
                dataSource: state.dataSource.concat(resp.Members),
                cursor: resp.Cursor,
                hasMore: resp.Cursor != 0,
            };
        },
    },
};