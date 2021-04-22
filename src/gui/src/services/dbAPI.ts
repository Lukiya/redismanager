import { extend } from 'umi-request';
import u from '@/u'
import { message } from 'antd';

const request = extend({
    prefix: u.LocalRootURL() + "api",
});

export async function GetMembers(query: any) {
    const key = query.redisKey?.Key ?? "";
    const type = query.redisKey?.Type ?? "";

    const url = '/servers/' + query.serverID + '/' + query.db;
    // + '?Cursor=' + query.cursor
    // + "&Count=" + query.count
    // + '&Key=' + encodeURIComponent(key)
    // + '&Type=' + type
    // + "&Match=" + encodeURIComponent(query.keyword);
    const r = await request.post(url, {
        data: {
            Key: key,
            Type: type,
            Query: {
                Cursor: query.cursor,
                Count: query.count,
                Keyword: query.keyword,
            },
            Queries: query.queries,
        }
    });

    return r;
}

export async function GetKey(query: any) {
    const url = '/servers/' + query.serverID + '/' + query.db + "/" + encodeURIComponent(query.redisKey.Key);
    const r = await request.get(url);

    return r;
}

export async function GetValue(query: any) {
    const url = '/servers/' + query.serverID + '/' + query.db + "/" + encodeURIComponent(query.redisKey.Key);
    const r = await request.post(url, {
        requestType: "form",
        data: { Element: query.field },
        responseType: "text",
    });

    return r;
}

export async function SaveEntry(query: any, data: any) {
    const url = '/servers/' + query.serverID + '/' + query.db;
    const r = await request.post(url, {
        data: data,
    });

    if (r.err != "") {
        message.error(r.err);
    }

    return r;
}

export async function DeleteEntry(query: any, element: string) {
    const url = '/servers/' + query.serverID + '/' + query.db + "/" + encodeURIComponent(query.key);
    const r = await request.delete(url, {
        requestType: "form",
        data: { Element: element },
    });

    if (r.err != "") {
        message.error(r.err);
    }

    return r;
}