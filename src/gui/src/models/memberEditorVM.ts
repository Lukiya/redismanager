import { GetRedisEntry, SaveEntry } from "@/services/dbAPI";
import u from "@/u";
import { message, notification } from 'antd';

export default {
    state: {
        Key: "",
        ElemKey: "",
        entry: u.DefaultEntry,
        visible: false,
        isNew: false,
        loading: false,
        keyEditorEnabled: false,
        fieldEditorEnabled: false,
        scoreEditorEnabled: false,
        indexEditorEnabled: false,
        valueEditorEnabled: false,
        newButtonEnabled: false,
        title: 'Editor',
    },
    effects: {
        *load(_: any, { put, select }: any): any {
            const state = yield select((x: any) => x["memberEditorVM"]);
            if (!state.Key) {
                return;
            }
            const query = {
                ServerID: state.serverID,
                DB: state.db,
                Key: state.Key,
                ElemKey: state.ElemKey,
            };
            const entry = yield GetRedisEntry(query);
            yield put({
                type: 'setState', payload: {
                    entry,
                    loading: false,
                    fieldEditorEnabled: entry.Type == u.HASH,
                    scoreEditorEnabled: entry.Type == u.ZSET,
                    indexEditorEnabled: entry.Type == u.LIST,
                    valueEditorEnabled: true,
                    title: entry.Key,
                },
            });
        },
        *save({ values }: any, { put, select }: any): any {
            const state = yield select((x: any) => x["memberEditorVM"]);
            const data = {
                new: values,
                old: state.entry,
                isNew: state.isNew,
            }

            const resp = yield SaveEntry(state, data);
            if (resp.success) {
                if (u.IsPresent(data.old.Key)) {
                    // refresh member list if it's edit
                    yield put({
                        type: "memberListVM/updateElement", payload: {
                            n: data.new,
                            o: data.old,
                        }
                    });
                }

                // refresh key list
                yield put({
                    type: "keyListVM/updateKey", payload: {
                        n: data.new,
                        o: data.old,
                    }
                });
                yield put({ type: "hide" });
            } else {
                // message.error(resp.err);
                notification.error({ message: resp.err, placement: "topLeft" });
            }
        },
    },
    reducers: {
        setState(state: any, { payload }: any) { return { ...state, ...payload }; },
        show(state: any, { payload }: any,) {
            let title = "Loading...";

            if (payload.isNew) {
                title = "New " + payload.entry.Type;
            }

            return {
                ...state,
                ...payload,
                visible: true,
                title,
            };
        },
        hide(state: any) {
            return {
                ...state,
                visible: false,
            };
        },
    },
};