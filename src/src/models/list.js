import { deleteMembers, getListElements } from '../services/api';
import u from '../utils/utils';

export default {
    namespace: 'list',

    state: {
        list: {},
        isBusy: false
    },

    effects: {
        *getListElements({ db, redisKey }, { call, put, select }) {
            console.log(2);
            yield put({ type: 'setBusy', payload: { isBusy: true } });
            const resp = yield call(getListElements, db, redisKey);
            yield put({ type: 'saveList', payload: { redisKey: redisKey, jsonObj: resp } });
            yield put({ type: 'setBusy', payload: { isBusy: false } });

            const state = yield select(states => states["list"]);
            if (state.list[redisKey].length === 0) {
                yield put({ type: 'keyList/removeEntries', payload: { entries: new Array({ Key: redisKey }) } });
            }
        },
        *deleteMember({ db, record }, { call, put }) {
            yield put({ type: 'setBusy', payload: { isBusy: true } });
            const msgCode = yield call(deleteMembers, db, new Array(record));
            yield put({ type: 'setBusy', payload: { isBusy: false } });

            if (u.isSuccess(msgCode)) {
                yield put({ type: 'getListElements', db: db, redisKey: record.Key });
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
                        "Type": "list",
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
            }
        },
    },
};