import request from '../utils/request';
import u from '../utils/utils';

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
        url: '/keys?db=' + encodeURIComponent(db)
    });
}

export function getHashElements(key) {
    return request({
        url: '/hash?key=' + encodeURIComponent(key)
    });
}

export function getListElements(key) {
    return request({
        url: '/list?key=' + encodeURIComponent(key)
    });
}

export function getSetElements(key) {
    return request({
        url: '/set?key=' + encodeURIComponent(key)
    });
}

export function getZSetElements(key) {
    return request({
        url: '/zset?key=' + encodeURIComponent(key)
    });
}

export function getEntry(key, field) {
    if (u.isNoW(field)) {
        return request({
            url: '/entry?key=' + encodeURIComponent(key)
        });
    } else {
        return request({
            url: '/entry?key=' + encodeURIComponent(key) + "&field=" + encodeURIComponent(field)
        });
    }
}

// export function minify(code) {
//     return request({
//         url: '/min',
//         method: 'POST',
//         data: {
//             code: code,
//         },
//         transformResponse: [(data) => { return data; }]
//     });
// }

export function saveEntry(editingEntry, backupEntry) {
    return request({
        url: '/entry',
        method: 'POST',
        data: {
            editing: editingEntry,
            backup: backupEntry
        },
    });
}