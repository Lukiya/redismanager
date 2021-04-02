import { extend } from 'umi-request';
import u from '@/u'

// 这里使用了extennd过的request新实例，确保了request不受app.ts里添加的中间件影响
const request = extend({
    prefix: u.LocalAPI(),
});

export async function GetServers() {
    const r = await request.get('/servers')
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