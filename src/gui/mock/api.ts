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
            "Keys": 15,
            "SubList": 10
        },
        "ListenAddr": ":16379"
    },

    'GET /api/v1/keys': [
        { "Key": "STRING", "Type": "string", "Field": "", "Value": "", "TTL": -1, "Length": 4, "IsNew": false },
        { "Key": "SET", "Type": "set", "Field": "", "Value": "", "TTL": -1, "Length": 4, "IsNew": false },
        { "Key": "ZSET", "Type": "zset", "Field": "", "Value": "", "TTL": -1, "Length": 4, "IsNew": false },
        { "Key": "DataProtection-Keys", "Type": "list", "Field": "", "Value": "", "TTL": -1, "Length": 4, "IsNew": false },
        { "Key": "MSGCODES", "Type": "hash", "Field": "", "Value": "", "TTL": -1, "Length": 4, "IsNew": false },
        { "Key": "ecp:API:Clients", "Type": "hash", "Field": "", "Value": "", "TTL": -1, "Length": 2, "IsNew": false },
        { "Key": "ecp:API:Resources", "Type": "hash", "Field": "", "Value": "", "TTL": -1, "Length": 1, "IsNew": false },
        { "Key": "ecp:PERMISSIONS", "Type": "hash", "Field": "", "Value": "", "TTL": -1, "Length": 10, "IsNew": false },
        { "Key": "ecp:ROUTES:hubadmin", "Type": "hash", "Field": "", "Value": "", "TTL": -1, "Length": 6, "IsNew": false },
        { "Key": "ecp:ROUTES:hubapi", "Type": "hash", "Field": "", "Value": "", "TTL": -1, "Length": 7, "IsNew": false },
        { "Key": "ecp:URIS", "Type": "hash", "Field": "", "Value": "", "TTL": -1, "Length": 12, "IsNew": false }
    ],

    'GET /api/v1/hash': { "IMGHUB": "https://lukiya.oss-us-west-1.aliyuncs.com/", "homeweb": "https://www.lukiya.com", "hubadmin": "https://admin.dreamvat.com", "hubapi": "https://v1.dreamvat.com", "hubpass": "https://pass.dreamvat.com", "hubsvc.customer": "localhost:9992", "hubsvc.img": "http://localhost:9000", "hubsvc.order": "localhost:9997", "hubsvc.post": "localhost:9996", "hubsvc.product": "localhost:9993", "hubsvc.user": "localhost:9994", "imghub": "https://lukiya.oss-us-west-1.aliyuncs.com/" },

    'GET /api/v1/list': ["\u003ckey id=\"51ce7fb5-1e5e-4179-9e98-6e059e41e493\" version=\"1\"\u003e\u003ccreationDate\u003e2019-06-04T21:02:08.1610524Z\u003c/creationDate\u003e\u003cactivationDate\u003e2019-06-04T21:02:08.1313662Z\u003c/activationDate\u003e\u003cexpirationDate\u003e2019-09-02T21:02:08.1313662Z\u003c/expirationDate\u003e\u003cdescriptor deserializerType=\"Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption.ConfigurationModel.AuthenticatedEncryptorDescriptorDeserializer, Microsoft.AspNetCore.DataProtection, Version=2.2.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60\"\u003e\u003cdescriptor\u003e\u003cencryption algorithm=\"AES_256_CBC\" /\u003e\u003cvalidation algorithm=\"HMACSHA256\" /\u003e\u003cmasterKey p4:requiresEncryption=\"true\" xmlns:p4=\"http://schemas.asp.net/2015/03/dataProtection\"\u003e\u003c!-- Warning: the key below is in an unencrypted form. --\u003e\u003cvalue\u003eroFSKE7MaZZOsRYyLYA011T6TzFSS5DI8LPn851Sjp16Ukk95ecJfQIy7GbBhwf7ws8oAI+kWRenna6Ng9e3mw==\u003c/value\u003e\u003c/masterKey\u003e\u003c/descriptor\u003e\u003c/descriptor\u003e\u003c/key\u003e", "\u003ckey id=\"d9521343-0dde-4048-a579-66f0da6b256e\" version=\"1\"\u003e\u003ccreationDate\u003e2019-09-19T22:01:38.1753801Z\u003c/creationDate\u003e\u003cactivationDate\u003e2019-09-19T22:01:38.1182063Z\u003c/activationDate\u003e\u003cexpirationDate\u003e2019-12-18T22:01:38.1182063Z\u003c/expirationDate\u003e\u003cdescriptor deserializerType=\"Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption.ConfigurationModel.AuthenticatedEncryptorDescriptorDeserializer, Microsoft.AspNetCore.DataProtection, Version=2.2.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60\"\u003e\u003cdescriptor\u003e\u003cencryption algorithm=\"AES_256_CBC\" /\u003e\u003cvalidation algorithm=\"HMACSHA256\" /\u003e\u003cmasterKey p4:requiresEncryption=\"true\" xmlns:p4=\"http://schemas.asp.net/2015/03/dataProtection\"\u003e\u003c!-- Warning: the key below is in an unencrypted form. --\u003e\u003cvalue\u003eERsWBWZspz53dIH3hxx/Fwg1V13pjeaXNWYvt7NVTTu81qm6ZZX6XXweES9Pdd8rixSwG0pLZJes4qTfwrXcpA==\u003c/value\u003e\u003c/masterKey\u003e\u003c/descriptor\u003e\u003c/descriptor\u003e\u003c/key\u003e", "\u003ckey id=\"f5cd460e-ffe7-453f-813f-12aab31f8319\" version=\"1\"\u003e\u003ccreationDate\u003e2019-12-16T23:24:38.7134033Z\u003c/creationDate\u003e\u003cactivationDate\u003e2019-12-18T22:01:38.1182063Z\u003c/activationDate\u003e\u003cexpirationDate\u003e2020-03-15T23:24:38.6981343Z\u003c/expirationDate\u003e\u003cdescriptor deserializerType=\"Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption.ConfigurationModel.AuthenticatedEncryptorDescriptorDeserializer, Microsoft.AspNetCore.DataProtection, Version=3.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60\"\u003e\u003cdescriptor\u003e\u003cencryption algorithm=\"AES_256_CBC\" /\u003e\u003cvalidation algorithm=\"HMACSHA256\" /\u003e\u003cmasterKey p4:requiresEncryption=\"true\" xmlns:p4=\"http://schemas.asp.net/2015/03/dataProtection\"\u003e\u003c!-- Warning: the key below is in an unencrypted form. --\u003e\u003cvalue\u003e4vOkoPR+yWkXF0UjCRzQej86Gh+R1XVKw1+do+5RnFEuGvw2O2Npl3urhneYGhNQi8CJYpZEGgfUS+ppbYMN6A==\u003c/value\u003e\u003c/masterKey\u003e\u003c/descriptor\u003e\u003c/descriptor\u003e\u003c/key\u003e", "\u003ckey id=\"1e020279-007d-496b-85cc-ca9f8c317b8e\" version=\"1\"\u003e\u003ccreationDate\u003e2020-03-14T18:25:32.3583373Z\u003c/creationDate\u003e\u003cactivationDate\u003e2020-03-15T23:24:38.6981343Z\u003c/activationDate\u003e\u003cexpirationDate\u003e2020-06-12T18:25:32.354602Z\u003c/expirationDate\u003e\u003cdescriptor deserializerType=\"Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption.ConfigurationModel.AuthenticatedEncryptorDescriptorDeserializer, Microsoft.AspNetCore.DataProtection, Version=3.1.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60\"\u003e\u003cdescriptor\u003e\u003cencryption algorithm=\"AES_256_CBC\" /\u003e\u003cvalidation algorithm=\"HMACSHA256\" /\u003e\u003cmasterKey p4:requiresEncryption=\"true\" xmlns:p4=\"http://schemas.asp.net/2015/03/dataProtection\"\u003e\u003c!-- Warning: the key below is in an unencrypted form. --\u003e\u003cvalue\u003eO2CqvVyo823jeoA2Uy6xgO7uH6NVJXUjslJZwIcuIELq23sb77NER+gfqevE5WmHt74l22uzMiPywjJ+VuvZJg==\u003c/value\u003e\u003c/masterKey\u003e\u003c/descriptor\u003e\u003c/descriptor\u003e\u003c/key\u003e"],
    'GET /api/v1/set': ["C", "B", "A"],
    'GET /api/v1/zset': [{ "Score": 1, "Member": "1" }, { "Score": 2, "Member": "2" }],

    'GET /api/v1/entry': { "Key": "ecp:PERMISSIONS", "Type": "hash", "Field": "", "Value": "", "TTL": -1, "Length": 10, "IsNew": false }
}