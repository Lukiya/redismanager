import { extend } from 'umi-request';
import u from '@/u'
import { message } from 'antd';

const request = extend({
    prefix: u.LocalRootURL() + "api",
});

export async function Scan(query: any) {
    const key = query.redisKey?.Key ?? "";
    const type = query.redisKey?.Type ?? "";

    const url = '/servers/' + query.serverID + '/' + query.db + "/scan";
    const r = await request.post(url, {
        data: {
            Key: key,
            Type: type,
            All: query.all,
            Query: {
                Cursor: query.cursor,
                Count: query.count,
                Keyword: query.keyword,
            },
            Cursors: query.cursors,
        }
    });

    return r;
}

export async function GetKey(query: any) {
    const url = '/servers/' + query.serverID + '/' + query.db + "/" + encodeURIComponent(query.redisKey.Key);
    const r = await request.get(url);

    return r;
}

// export async function GetValue(query: any) {
//     const url = '/servers/' + query.serverID + '/' + query.db + "/" + encodeURIComponent(query.redisKey.Key);
//     const r = await request.post(url, {
//         requestType: "form",
//         data: { ElementKey: query.ElementKey },
//         responseType: "text",
//     });

//     return r;
// }

export async function GetRedisEntry(query: any) {
    const url = '/servers/' + query.ServerID + '/' + query.DB + "/" + encodeURIComponent(query.Key);
    const r = await request.post(url, {
        requestType: "form",
        data: { ElementKey: query.ElemKey },
        // responseType: "text",
    });

    return r;
}

export async function SaveEntry(query: any, data: any) {
    const url = '/servers/' + query.serverID + '/' + query.db + '/save';
    const r = await request.post(url, {
        data: data,
    });

    // if (r?.err) {
    //     message.error(r.err);
    // }

    return r;
}

export async function DeleteEntries(query: any, cmd: any) {
    const url = '/servers/' + query.serverID + '/' + query.db;
    const r = await request.delete(url, {
        data: cmd,
    });

    // if (r) {
    //     message.error(r.err);
    // }

    return r;
}

export async function ExportKeys(query: any, keys: string[]) {
    const url = '/servers/' + query.serverID + '/' + query.db + '/keys/export';

    const r = await request.post(url, {
        data: keys,
    });

    return r;
}

export async function ImportKeys(query: any, data: any) {
    const url = '/servers/' + query.serverID + '/' + query.db + '/keys/import';

    const r = await request.post(url, {
        data: data,
    });

    return r;
}