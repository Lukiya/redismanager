import u from '@/u';
import { request } from 'umi';

export async function GetInfo() {
    const r = await request(u.LocalRootURL(), {
    })
        .then(function (resp) {
            return resp;
        })
        .catch(function (err) {
            console.error(err);
        });

    return r;
}