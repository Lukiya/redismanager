import { extend } from 'umi-request';
import u from '@/u'

const request = extend({
    prefix: u.LocalAPI(),
});

export async function GetEntries(query: any) {
    const url = '/clusters/' + query.clusterID + '/' + query.nodeID + '/' + query.db + '/keys?Cursor=' + query.cursor + "&PageSize=" + query.pageSize + "&Match=" + encodeURIComponent(query.match);
    const r = await request.get(url)
        .then(function (resp) {
            return resp;
        })
        .catch(function (err) {
            console.error(err);
        });

    return r;
}