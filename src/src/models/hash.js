import { deleteMembers, getHashElements } from '../services/api';
import u from '../utils/utils';

export default {
    namespace: 'hash',

    state: {
        list: {},
        isBusy: false
    },

    effects: {
        *getHashElements({ db, redisKey }, { call, put, select }) {
            yield put({ type: 'setBusy', payload: { isBusy: true } });
            const resp = yield call(getHashElements, db, redisKey);
            yield put({ type: 'saveList', payload: { redisKey: redisKey, jsonObj: resp } });
            yield put({ type: 'setBusy', payload: { isBusy: false } });

            const state = yield select(states => states["hash"]);
            if (state.list[redisKey].length === 0) {
                yield put({ type: 'keyList/removeEntries', payload: { entries: new Array({ Key: redisKey }) } });
            }
        },
        *deleteMember({ db, record }, { call, put }) {
            yield put({ type: 'setBusy', payload: { isBusy: true } });
            const msgCode = yield call(deleteMembers, db, new Array(record));
            yield put({ type: 'setBusy', payload: { isBusy: false } });

            if (u.isSuccess(msgCode)) {
                yield put({ type: 'getHashElements', db: db, redisKey: record.Key });
            }
        },
    },

    reducers: {
        saveList(state, { payload: { redisKey, jsonObj } }) {
            const data = []
            if (!u.isNoW(jsonObj)) {
                for (var propName in jsonObj) {
                    data.push({
                        "Key": redisKey,
                        "Type": "hash",
                        "Field": propName,
                        "Value": jsonObj[propName],
                    });
                }
            }
            state.list[redisKey] = data;
            return state;
        },
        setBusy(state, { payload: { isBusy } }) {
            return {
                ...state,
                isBusy
            };
        },
    },
};