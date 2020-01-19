import request from '../utils/request'

export function getDBs() {
    return request({
        url: '/dbs'
    });
}

export function getConfigs() {
    return request({
        url: '/configs'
    });
}

export function getKeys(db) {
    return request({
        url: '/keys?db=' + db
    });
}

export function getHashList(key) {
    return request({
        url: '/hash?key=' + key
    });
}