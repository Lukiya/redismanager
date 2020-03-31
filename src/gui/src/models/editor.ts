import { Effect, Reducer, IRedisEntry } from 'umi';
import { getEntry } from '@/services/api'
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
    };
    reducers: {
        setState: Reducer<IEditorModelState>;
        hide: Reducer<IEditorModelState>;
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
    }
    else {
        r.TTLEditorEnabled = !u.isNoW(entry.Field);
        r.FieldEditorEnabled = entry.Type === u.HASH || entry.Type === u.ZSET;
    }

    if (entry.IsNew) {
        r.KeyEditorEnabled = true;
        r.ValueEditorEnabled = true;
        r.TTLEditorEnabled = entry.Type === u.STRING;
        r.FieldEditorEnabled = entry.Type === u.HASH || entry.Type === u.ZSET;
    }

    return r;
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
    },
    reducers: {
        setState(state: any, action) {
            return {
                ...state,
                ...action.payload,
            };
        },
        hide(state: any) {
            return {
                ...state,
                Visible: false,
            };
        },
    },
};

export default EditorModel;