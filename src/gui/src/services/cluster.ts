import { extend } from 'umi-request';
import u from '@/u'

const request = extend({
    prefix: u.LocalAPI(),
});

export async function SaveCluster(values: any) {
    const r = await request.post('/cluster', {
        data: values,
    })
        .then(function (resp) {
            return resp;
        })
        .catch(function (err) {
            console.error(err);
        });

    return r;
}

export async function GetClusters() {
    const r = await request.get('/clusters')
        .then(function (resp) {
            return resp;
        })
        .catch(function (err) {
            console.error(err);
        });

    return r;

    // if (r != null && r != undefined) {
    //     return {
    //         data: r.Results,
    //         success: true,
    //         total: r.TotalCount,
    //     };
    // }

    // return u.DefaultTableData;
}

export async function SelectCluster(id: string) {
    const r = await request.post('/cluster/' + id)
        .then(function (resp) {
            return resp;
        })
        .catch(function (err) {
            console.error(err);
        });

    return r;
}

export async function RemoveCluster(id: string) {
    const r = await request.delete('/cluster/' + id)
        .then(function (resp) {
            return resp;
        })
        .catch(function (err) {
            console.error(err);
        });

    return r;
}