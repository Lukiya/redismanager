import request from '@/utils/request';
import u from '@/utils/u';

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

export function getKeys(db: number) {
    return request({
        url: '/keys?db=' + encodeURIComponent(db)
    });
}

export function getHashElements(db: number, key: string) {
    return request({
        url: '/hash?db=' + encodeURIComponent(db) + '&key=' + encodeURIComponent(key)
    });
}

export function getListElements(db: number, key: string) {
    return request({
        url: '/list?db=' + encodeURIComponent(db) + '&key=' + encodeURIComponent(key)
    });
}

export function getSetElements(db: number, key: string) {
    return request({
        url: '/set?db=' + encodeURIComponent(db) + '&key=' + encodeURIComponent(key)
    });
}

export function getZSetElements(db: number, key: string) {
    return request({
        url: '/zset?db=' + encodeURIComponent(db) + '&key=' + encodeURIComponent(key)
    });
}

export function getEntry(db: number, key: string, field: string) {
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

export function saveEntry(db: number, editingEntry: any, backupEntry: any) {
    return request({
        url: '/entry?db=' + encodeURIComponent(db),
        method: 'POST',
        data: {
            editing: editingEntry,
            backup: backupEntry
        },
    });
}

export function deleteKeys(db: number, entries: any) {
    return request({
        url: '/keys?db=' + encodeURIComponent(db),
        method: 'DELETE',
        data: entries,
    });
}

export function deleteMembers(db: number, entries: any) {
    return request({
        url: '/members?db=' + encodeURIComponent(db),
        method: 'DELETE',
        data: entries,
    });
}

export function exportKeys(db: number, keys: string[]) {
    return request({
        url: '/export/keys?db=' + encodeURIComponent(db),
        method: 'POST',
        data: keys,
    });
}

export function importKeys(db: number, data: any) {
    return request({
        url: '/import/keys?db=' + encodeURIComponent(db),
        method: 'POST',
        data: data,
    });
}

export function exportFile(db: number, keys: string[]) {
    return request({
        url: '/export/file?db=' + encodeURIComponent(db),
        method: 'POST',
        data: keys,
    });
}

export function importFile(db: number, data: any) {
    return request({
        url: '/import/file?db=' + encodeURIComponent(db),
        method: 'POST',
        data: data,
    });
}

export function getServers() {
    return request({
        url: '/servers',
        method: 'GET',
    });
}

export function selectServer(id: string) {
    return request({
        url: '/servers/' + encodeURIComponent(id),
        method: 'POST',
    });
}