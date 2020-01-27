import { getEntry, minify } from '../services/api';
import jsbeautifier from 'js-beautify'
import u from '../utils/utils'
// import minify from 'html-minifier'
// import Terser from 'terser'

export default {
    namespace: 'editor',

    state: {
        entry: {},
        isBusy: false,
    },

    effects: {
        *getEntry({ redisKey, redisField }, { call, put }) {
            yield put({ type: 'setBusy', payload: { isBusy: true } });
            const resp = yield call(getEntry, redisKey, redisField);
            yield put({ type: 'saveEntry', payload: { entry: resp } });
            yield put({ type: 'setBusy', payload: { isBusy: false } });
        },
        *minify({ payload: { value } }, { call, put }) {
            const resp = yield call(minify, value);
            yield put({ type: 'saveValue', payload: { value: resp } });
        },
    },

    reducers: {
        beautify(state, { _ }) {
            var newValue = jsbeautifier.js(state.entry.Value, {
                indent_size: 2,
                space_in_empty_paren: true,
                // brace_style: 'preserve-inline',
            })

            return {
                ...state,
                entry: {
                    ...state.entry,
                    Value: newValue
                }
            }
        },
        // minify(state, { _ }) {
        //     // var newValue = minify(state.entry.Value, {
        //     //     minifyJS: true,
        //     //     minifyCSS: true,
        //     // })
        //     // var newValue = UglifyJS.minify(state.entry.Value)
        //     minify(state.entry.Value)

        //     // var result = Terser.minify(state.entry.Value, {
        //     //     parse: { expression: true },
        //     // })

        //     return {
        //         ...state,
        //         entry: {
        //             ...state.entry,
        //             Value: result.code
        //         }
        //     }
        // },
        saveEntry(state, { payload: { entry } }) {
            return {
                ...state,
                entry,
            }
        },
        saveValue(state, { payload: { value } }) {
            if (!u.isNoW(value.code)) {
                return state;
            }
            return {
                ...state,
                entry: {
                    ...state.entry,
                    Value: value
                }
            }
        },
        setBusy(state, { payload: { isBusy } }) {
            return {
                ...state,
                isBusy
            }
        }
    },
};