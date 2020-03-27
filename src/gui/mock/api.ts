export default {
    // 支持值为 Object 和 Array
    'GET /api/v1/dbs': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],

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

    'GET /api/v1/keys': [
        { "Key": "DataProtection-Keys", "Type": "list", "Field": "", "Value": "", "TTL": -1, "Length": 4, "IsNew": false },
        { "Key": "MSGCODES", "Type": "hash", "Field": "", "Value": "", "TTL": -1, "Length": 4, "IsNew": false },
        { "Key": "ecp:API:Clients", "Type": "hash", "Field": "", "Value": "", "TTL": -1, "Length": 2, "IsNew": false },
        { "Key": "ecp:API:Resources", "Type": "hash", "Field": "", "Value": "", "TTL": -1, "Length": 1, "IsNew": false },
        { "Key": "ecp:PERMISSIONS", "Type": "hash", "Field": "", "Value": "", "TTL": -1, "Length": 10, "IsNew": false },
        { "Key": "ecp:ROUTES:hubadmin", "Type": "hash", "Field": "", "Value": "", "TTL": -1, "Length": 6, "IsNew": false },
        { "Key": "ecp:ROUTES:hubapi", "Type": "hash", "Field": "", "Value": "", "TTL": -1, "Length": 7, "IsNew": false },
        { "Key": "ecp:URIS", "Type": "hash", "Field": "", "Value": "", "TTL": -1, "Length": 12, "IsNew": false }
    ]
}