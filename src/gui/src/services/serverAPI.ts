import { extend } from 'umi-request';
import u from '@/u'

const request = extend({
    prefix: u.LocalRootURL() + "api",
});

export async function SaveServer(data: any) {
    const r = await request.post('/server', {
        data: data,
    });
    return r;
}

export async function GetServers() {
    const r = await request.get('/servers');

    return r;
}

export async function GetServer(serverID: string) {
    const r = await request.get('/servers/' + serverID).catch((e: any) => e.data);

    return r;
}

export async function SelectServer(id: string) {
    const r = await request.post('/servers/' + id);

    return r;
}

export async function RemoveServer(id: string) {
    const r = await request.delete('/servers/' + id);

    return r;
}