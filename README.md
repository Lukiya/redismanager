# Redis Manager
## Intro

Redis Manager is an open source, cross-platform and completely free redis management GUI. Its server host side is writen by GO, and GUI side is writen by react + umi + ant design.

## Quick start
#### Using excutable files
Visit https://github.com/Lukiya/redismanager/releases, download executable file
#### Or, using docker
###### Default settings
``` bash
docker run --name redismanager -d --restart always -p 16379:16379 lukiya/redismanager
```
###### Custom settings
``` bash
docker run --name redismanager -d --restart always -p 16379:16379 -v /data/redismanager/configs.json:/app/configs.json lukiya/redismanager
```
#### Configuration file
There is a configuration file called "configs.json" for Redis Manager, here's example and instructions for it:
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
    "PageSize": {
        "KeyList": 15,        // Page size for key list
        "SubList": 10         // Page size for sub member list
    },
    "ListenAddr": ":16379"    // Listen address and port
}
```
#### Notes
* For cluster, make sure you adding all nodes into configuration array.
* For Mac, make sure you allow it in settings ("Security & Privacy" -> "General" -> "Allow apps downloaded from").
#### You are all set
Run excutable file or run an docker image, then open a broswer, and access http://localhost:16379 (or http://RemoteIP:Port) to start using it.


## Source code
#### DEV environment
* golang https://golang.org
* node.js https://nodejs.org/en/download
* powershell https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell
* upx (optional) https://github.com/upx/upx/releases
* docker (optional) https://www.docker.com
#### GUI DEV documents
* react https://reactjs.org/
* umijs https://umijs.org/
* ant design https://ant.design/
#### Build
There are 6 powershell scripts for building source code.
* **build-js.ps1**: build js file and generate bindata
* **build-linux.ps1**: build linux executable file.
* **build-mac.ps1**: build mac executable file.
* **build-win.ps1**: build windows executable file.
* **build-docker.ps1**: build docker image file.
* **build.ps1**: build all platform executable file including docker image.

After built, all executable files will be saved under **dist** folder.
