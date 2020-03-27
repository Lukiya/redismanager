export default {
    // 支持值为 Object 和 Array
    'GET /api/v1/dbs': [0, 1, 2, 3, 4, 5, 6, 7],

    'GET /api/v1/configs': {
        "Log": {
            "Level": "debug"
        },
        "Redis": {
            "Addrs": [
                "localhost:6379"
            ],
            "Password": "Famous901"
        },
        "PageSize": {
            "KeyList": 15,
            "SubList": 10
        },
        "ListenAddr": ":16379"
    },

    // // GET 可忽略
    // '/api/users/1': { id: 1 },

    // 支持自定义函数，API 参考 express@4
    // 'POST /api/users/create': (req, res) => {
    //     // 添加跨域请求头
    //     res.setHeader('Access-Control-Allow-Origin', '*');
    //     res.end('ok');
    // },
}