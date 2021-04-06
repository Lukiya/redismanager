import { extend } from 'umi-request';
import u from '@/u'

const request = extend({
    prefix: u.LocalAPI(),
});

export async function SaveServer(data: any) {
    const r = await request.post('/server', {
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

export async function GetServers() {
    const r = await request.get('/servers')
        .then(function (resp) {
            return resp;
        })
        .catch(function (err) {
            console.error(err);
        });

    return r;
}

export async function GetServer(serverID: string) {
    const r = await request.get('/servers/' + serverID)
        .then(function (resp) {
            return resp;
        })
        .catch(function (err) {
            console.error(err);
        });

    return r;
}

export async function SelectServer(id: string) {
    const r = await request.post('/servers/' + id)
        .then(function (resp) {
            return resp;
        })
        .catch(function (err) {
            console.error(err);
        });

    return r;
}

export async function RemoveServer(id: string) {
    const r = await request.delete('/servers/' + id)
        .then(function (resp) {
            return resp;
        })
        .catch(function (err) {
            console.error(err);
        });

    return r;
}