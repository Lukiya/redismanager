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

export function getHashElements(key) {
    return request({
        url: '/hash?key=' + key
    });
}

export function getListElements(key) {
    return request({
        url: '/list?key=' + key
    });
}

export function getSetElements(key) {
    return request({
        url: '/set?key=' + key
    });
}

export function getZSetElements(key) {
    return request({
        url: '/zset?key=' + key
    });
}