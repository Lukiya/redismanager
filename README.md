# redismanager, a cross-platform redis gui client.
### Intro

&nbsp;&nbsp;&nbsp;&nbsp; Redis Manager is an open source, cross-platform and completely free redis management GUI. Its server side is writen by GO, and client side is writen by react + umi + ant design ui.


### Quick start
#### DEV environment
* golang https://golang.org
* node.js https://nodejs.org/en/download
* powershell https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell
* npx (optional) https://github.com/upx/upx/releases
* docker (optional) https://www.docker.com
#### Build
There are 6 powershell scripts for building source code.
* build-js.ps1 build js file and generate bindata
* build-linux.ps1 build linux executable file.
* build-mac.ps1 build mac executable file.
* build-win.ps1 build windows executable file.
* build-docker.ps1 build docker image file.
* build.ps1 build all platform executable file including docker image.
