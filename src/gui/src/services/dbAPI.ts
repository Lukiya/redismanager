import { extend } from 'umi-request';
import u from '@/u'
import { message } from 'antd';

const request = extend({
    prefix: u.LocalRootURL() + "api",
});

export async function GetMembers(query: any) {
    const key = query.redisKey?.Key ?? "";
    const type = query.redisKey?.Type ?? "";

    const url = '/servers/' + query.serverID + '/' + query.nodeID + '/' + query.db
        + '?Cursor=' + query.cursor
        + "&Count=" + query.count
        + '&Key=' + encodeURIComponent(key)
        + '&Type=' + type
        + "&Match=" + encodeURIComponent(query.keyword);
    const r = await request.get(url);

    return r;
}

export async function GetKey(query: any) {
    const url = '/servers/' + query.serverID + '/' + query.nodeID + '/' + query.db + "/" + encodeURIComponent(query.redisKey.Key);
    const r = await request.get(url);

    return r;
}

export async function GetValue(query: any) {
    const url = '/servers/' + query.serverID + '/' + query.nodeID + '/' + query.db + "/" + encodeURIComponent(query.redisKey.Key) + "/" + encodeURIComponent(query.field);
    const r = await request.get(url, {
        responseType: "text",
    });

    return r;
}

export async function SaveEntry(query: any, data: any) {
    const url = '/servers/' + query.serverID + '/' + query.nodeID + '/' + query.db;
    const r = await request.post(url, {
        data: data,
    });

    if (r.err != "") {
        message.error(r.err);
    }

    return r;
}