import { extend } from 'umi-request';
import u from '@/u'

const request = extend({
    prefix: u.LocalAPI(),
});

export async function SaveCluster(data: any) {
    const r = await request.post('/cluster', {
        data: data,
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
}

export async function GetCluster(clusterID: string) {
    const r = await request.get('/clusters/' + clusterID)
        .then(function (resp) {
            return resp;
        })
        .catch(function (err) {
            console.error(err);
        });

    return r;
}

export async function SelectCluster(id: string) {
    const r = await request.post('/clusters/' + id)
        .then(function (resp) {
            return resp;
        })
        .catch(function (err) {
            console.error(err);
        });

    return r;
}

export async function RemoveCluster(id: string) {
    const r = await request.delete('/clusters/' + id)
        .then(function (resp) {
            return resp;
        })
        .catch(function (err) {
            console.error(err);
        });

    return r;
}