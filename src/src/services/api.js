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

export function getHashElements(db, key) {
    return request({
        url: '/hash?db=' + encodeURIComponent(db) + '&key=' + encodeURIComponent(key)
    });
}

export function getListElements(db, key) {
    return request({
        url: '/list?db=' + encodeURIComponent(db) + '&key=' + encodeURIComponent(key)
    });
}

export function getSetElements(db, key) {
    return request({
        url: '/set?db=' + encodeURIComponent(db) + '&key=' + encodeURIComponent(key)
    });
}

export function getZSetElements(db, key) {
    return request({
        url: '/zset?db=' + encodeURIComponent(db) + '&key=' + encodeURIComponent(key)
    });
}

export function getEntry(db, key, field) {
    if (u.isNoW(field)) {
        return request({
            url: '/entry?db=' + encodeURIComponent(db) + '&key=' + encodeURIComponent(key)
        });
    } else {
        return request({
            url: '/entry?db=' + encodeURIComponent(db) + '&key=' + encodeURIComponent(key) + "&field=" + encodeURIComponent(field)
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

export function saveEntry(db, editingEntry, backupEntry) {
    return request({
        url: '/entry?db=' + encodeURIComponent(db),
        method: 'POST',
        data: {
            editing: editingEntry,
            backup: backupEntry
        },
    });
}

export function deleteKeys(db, entries) {
    return request({
        url: '/keys?db=' + encodeURIComponent(db),
        method: 'DELETE',
        data: entries,
    });
}

export function deleteMembers(db, entries) {
    return request({
        url: '/members?db=' + encodeURIComponent(db),
        method: 'DELETE',
        data: entries,
    });
}

export function exportKeys(db, keys) {
    return request({
        url: '/export/keys?db=' + encodeURIComponent(db),
        method: 'POST',
        data: keys,
    });
}

export function importKeys(db, data) {
    return request({
        url: '/import/keys?db=' + encodeURIComponent(db),
        method: 'POST',
        data: data,
    });
}

export function exportFile(db, keys) {
    return request({
        url: '/export/file?db=' + encodeURIComponent(db),
        method: 'POST',
        data: keys,
    });
}

export function importFile(db, data) {
    return request({
        url: '/import/file?db=' + encodeURIComponent(db),
        method: 'POST',
        data: data,
    });
}