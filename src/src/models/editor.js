import { getEntry, saveEntry } from '../services/api';
import vkbeautify from 'vkbeautify'
import u from '../utils/utils';

export default {
    namespace: 'editor',

    state: {
        entry: {},
        mode: 'text',
        isLoading: false,
        isBusy: false,
    },

    effects: {
        *load({ redisKey, redisField }, { call, put }) {
            yield put({ type: 'setLoading', payload: { isLoading: true } });
            const resp = yield call(getEntry, redisKey, redisField);
            yield put({ type: 'setEntry', payload: { entry: resp } });
            yield put({ type: 'setLoading', payload: { isLoading: false } });
        },
        *save({ payload: { entry } }, { call, put }) {
            yield put({ type: 'setBusy', payload: { isBusy: true } });
            const resp = yield call(saveEntry, entry);
            console.debug(resp);
            yield put({ type: 'setBusy', payload: { isBusy: false } });
        },
    },

    reducers: {
        beautify(state, { payload: { mode } }) {
            let newValue = state.entry.Value;
            if (mode === "javascript") {
                newValue = vkbeautify.json(newValue, 4);
            } else if (mode === "xml") {
                newValue = vkbeautify.xml(newValue, 4);
            }

            return {
                ...state,
                entry: {
                    ...state.entry,
                    Value: newValue
                }
            }
        },
        minify(state, { payload: { mode } }) {
            let newValue = state.entry.Value;
            if (mode === "javascript") {
                newValue = vkbeautify.jsonmin(newValue);
            } else if (mode === "xml") {
                newValue = vkbeautify.xmlmin(newValue);
            }

            return {
                ...state,
                entry: {
                    ...state.entry,
                    Value: newValue
                }
            }
        },
        setTTL(state, { payload: { ttl } }) {
            return {
                ...state,
                entry: {
                    ...state.entry,
                    TTL: ttl
                }
            }
        },
        setValue(state, { payload: { value } }) {
            let mode = 'text';
            if (u.isJson(value)) {
                mode = "javascript";
            } else if (u.isXml(value)) {
                mode = "xml";
            }

            if (state.mode !== mode) {
                return {
                    ...state,
                    mode,
                    entry: {
                        ...state.entry,
                        Value: value
                    }
                }
            } else {
                state.entry.Value = value;
                return state;
            }
        },
        setEntry(state, { payload: { entry } }) {
            let mode = 'text';
            if (u.isJson(entry.Value)) {
                mode = "javascript";
            } else if (u.isXml(entry.Value)) {
                mode = "xml";
            }

            return {
                ...state,
                entry,
                mode,
            }
        },
        setBusy(state, { payload: { isBusy } }) {
            return {
                ...state,
                isBusy
            }
        },
        setLoading(state, { payload: { isLoading } }) {
            return {
                ...state,
                isLoading
            }
        }
    },
};