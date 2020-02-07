# Redis Manager
## Intro

Redis Manager is an open source, cross-platform and completely free redis management GUI. Its server side is writen by GO, and client side is writen by react + umi + ant design ui.


## Quick start
#### DEV environment
* golang https://golang.org
* node.js https://nodejs.org/en/download
* powershell https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell
* upx (optional) https://github.com/upx/upx/releases
* docker (optional) https://www.docker.com
#### Build
There are 6 powershell scripts for building source code.
* src/build-js.ps1 build js file and generate bindata
* src/build-linux.ps1 build linux executable file.
* src/build-mac.ps1 build mac executable file.
* src/build-win.ps1 build windows executable file.
* src/build-docker.ps1 build docker image file.
* src/build.ps1 build all platform executable file including docker image.

After built, all executable files will be saved under **dist** folder.
#### configs.json
This is the configuration file for Redis Manager, here's an example:
``` javascript
{
    "Log": {
        "Level": "warn"       // log level [debug,info,warn,error]
    },
    "Redis": {
        "Addrs": [
            "localhost:6379"  // Redis server address and port, enable cluster support by adding all nodes into this array
        ],
        "Password": ""        // Password for redis server
    },
    "PageSize": 5,            // Page size for key member list
    "ListenAddr": ":16379"    // Listen address and port
}
```
#### You are all set
Run excutable file or run an docker image, then open a broswer, and access http://localhost:16379 (or http://RemoteIP:Port) to start using it.


## Docker using guide
#### From docker hub
1. docker pull lukiya/redismanager
2. docker run --name redismanager -d --restart always -p 16379:16379 -v /data/redismanager/configs.json:/app/configs.json lukiya/redismanager
#### From local image
1. docker load -i ./dist/docker/redismanager.tar
2. docker run --name redismanager -d --restart always -p 16379:16379 -v /data/redismanager/configs.json:/app/configs.json redismanager
