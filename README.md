# Redis Manager
## Intro

Redis Manager is an open source, cross-platform and completely free redis management GUI. Its server host side is writen by GO, and GUI side is writen by react + umi + ant design.
## Configuration
There are 2 settings file, called "configs.json" and "servers.json"
##### configs.json
It stored some basic configuration for RedisManager, here's an example and instructions for it:
``` javascript
{
    "Log": {
        "Level": "warn"       // log level [debug,info,warn,error]
    },
    "ListenAddr": ":16379"    // Listen address and port
}
```

##### servers.json
It stored all redis servers infomation you want to manage.


**Please beware, this file is unencrypted. Make sure it can only be accessed by yourself.**

## Quick start
#### Using excutable files
Visit https://github.com/Lukiya/redismanager/releases, download executable file
#### using docker
``` bash
docker run --name redismanager -d --restart always --net host lukiya/redismanager
```
or
``` bash
docker run --name redismanager -d --restart always -p 16379:16379 lukiya/redismanager
```
if you want to backup or restore Servers.json, use below command:
``` bash
docker cp redismanager:/app/Servers.json /data/redismanager/Servers.json
docker cp /data/redismanager/Servers.json redismanager:/app/Servers.json
```
or just use volume map to save Servers.json outside of docker instance.
**Please beware, this file is unencrypted. Make sure it can only be accessed by yourself.**
#### Notes
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
* typescript https://www.typescriptlang.org/
#### Build
There are 6 powershell scripts for building source code.
* **build-js.ps1**: build js file and generate bindata
* **build-linux.ps1**: build linux executable file.
* **build-mac.ps1**: build mac executable file.
* **build-win.ps1**: build windows executable file.
* **build-docker.ps1**: build docker image file.
* **build.ps1**: build all platform executable file including docker image.

After built, all binary files will be saved under **dist** folder.
