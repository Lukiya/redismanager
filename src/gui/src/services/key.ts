import { extend } from 'umi-request';
import u from '@/u'

const request = extend({
    prefix: u.LocalAPI(),
});

export async function GetEntries(query: any) {
    query.match = query.match ?? "";
    const url = '/clusters/' + query.clusterID + '/' + query.nodeID + '/' + query.db + '/keys?Cursor=' + query.cursor + "&Count=" + query.count + "&Match=" + encodeURIComponent(query.match);
    const r = await request.get(url)
        .then(function (resp) {
            return resp;
        })
        .catch(function (err) {
            console.error(err);
        });

    return r;
}