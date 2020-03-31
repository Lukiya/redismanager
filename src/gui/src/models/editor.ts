import { Effect, Reducer, IRedisEntry } from 'umi';
import { getEntry, saveEntry } from '@/services/api'
import u from '@/utils/u';

export interface IEditorModelState {
    DB: number;             // current DB
    BackupEntry: any;       // Backup entry, for undo using
    EditingEntry: any;      // Editing entry, for editing using
    ValueEditorMode: string;
    Visible: boolean;
    KeyEditorEnabled: boolean;
    FieldEditorEnabled: boolean;
    TTLEditorEnabled: boolean;
    ValueEditorEnabled: boolean;
}

export interface IEditorModel {
    state: IEditorModelState;
    effects: {
        show: Effect;
        save: Effect;
    };
    reducers: {
        setState: Reducer<IEditorModelState>;
        hide: Reducer<IEditorModelState>;
        setKey: Reducer<IEditorModelState>;
        setField: Reducer<IEditorModelState>;
        setTTL: Reducer<IEditorModelState>;
        setValue: Reducer<IEditorModelState>;
    };
}

function editorSwitch(entry: IRedisEntry): any {
    const r = {
        TTLEditorEnabled: true,
        KeyEditorEnabled: true,
        FieldEditorEnabled: true,
        ValueEditorEnabled: true,
    };

    if (entry.Type === u.STRING) {
        r.FieldEditorEnabled = false;
    } else if (entry.IsNew) {
        r.FieldEditorEnabled = entry.Type === u.HASH || entry.Type === u.ZSET;
    } else {
        r.TTLEditorEnabled = u.isNoW(entry.Field);
        r.ValueEditorEnabled = !u.isNoW(entry.Field);
        r.FieldEditorEnabled = !u.isNoW(entry.Field);
    }

    return r;
}

function getValueEditorMode(value: string): any {
    let valueEditorMode = 'text';
    if (u.isJson(value)) {
        valueEditorMode = "javascript";
    } else if (u.isXml(value)) {
        valueEditorMode = "xml";
    }
    return valueEditorMode;
}

const EditorModel: IEditorModel = {
    state: {
        DB: -1,
        BackupEntry: {},
        EditingEntry: {},
        ValueEditorMode: "text",
        Visible: false,
        KeyEditorEnabled: true,
        FieldEditorEnabled: true,
        TTLEditorEnabled: true,
        ValueEditorEnabled: true,
    },

    effects: {
        *show({ payload: { db, entry } }, { call, put }) {
            if (!entry.IsNew) {
                // Editing, Load entry data
                const resp = yield call(getEntry, db, entry.Key, entry.Field);
                const editorSwitches = editorSwitch(resp);
                yield put({
                    type: 'setState', payload: {
                        Visible: true,
                        DB: db,
                        EditingEntry: resp,
                        BackupEntry: resp,
                        ...editorSwitches,
                    }
                });
            } else {
                // Creating
                const editorSwitches = editorSwitch(entry);
                yield put({
                    type: 'setState', payload: {
                        Visible: true,
                        DB: db,
                        EditingEntry: entry,
                        BackupEntry: entry,
                        ...editorSwitches,
                    }
                });
            }
        },
        *save({ _ }, { call, put, select }) {
            const state = yield select((x: any) => x["editor"]);

            const msgCode = yield call(saveEntry, state.DB, state.EditingEntry, state.BackupEntry);

            if (u.isSuccess(msgCode)) {
                yield put({ type: 'hide' });
                yield put({ type: 'keytable/refreshEntry', payload: { Key: state.EditingEntry.Key } });
            }
        },
    },
    reducers: {
        setState(state, { payload }) {
            return {
                ...state,
                ...payload,
            };
        },
        hide(state: any) {
            return {
                ...state,
                DB: -1,
                Visible: false,
            };
        },
        setKey(state: any, { payload: { key } }) {
            return {
                ...state,
                EditingEntry: {
                    ...state.EditingEntry,
                    Key: key
                }
            }
        },
        setField(state: any, { payload: { field } }) {
            return {
                ...state,
                EditingEntry: {
                    ...state.EditingEntry,
                    Field: field
                }
            }
        },
        setTTL(state: any, { payload: { ttl } }) {
            let newValue = parseInt(ttl);
            if (isNaN(newValue) || newValue <= 0) {
                newValue = -1;
            }
            return {
                ...state,
                EditingEntry: {
                    ...state.EditingEntry,
                    TTL: newValue
                }
            }
        },
        setValue(state: any, { payload: { value } }) {
            const valueEditorMode = getValueEditorMode(value);

            if (state.valueEditorMode !== valueEditorMode) {
                return {
                    ...state,
                    ValueEditorMode: valueEditorMode,
                    EditingEntry: {
                        ...state.EditingEntry,
                        Value: value
                    }
                }
            } else {
                state.EditingEntry.Value = value;
                return state;
            }
        },
    },
};

export default EditorModel;