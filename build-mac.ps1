Set-Location ./src/host

$imageName = "redismanager"
$targetDir = "../../dist/mac/"
$binPathAMD64 = $targetDir + $imageName + "_amd64"
$binPathARM64 = $targetDir + $imageName + "_arm64"

$APP_NAME = "Redis Manager"
$APP_VERSION = $(git describe --tags --abbrev=0)
$BUILD_VERSION = $(git log -1 --oneline)
$BUILD_TIME=$(Get-date)
# $GIT_REVISION=$(git rev-parse --short HEAD)
$GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
# $GIT_TAG=$(git name-rev --name-only HEAD)
$GO_VERSION=$(go version)

$FLAGS = "-s -w -X 'main.AppName=${APP_NAME}'`
             -X 'main.AppVersion=${APP_VERSION}'`
             -X 'main.BuildVersion=${BUILD_VERSION}'`
             -X 'main.BuildTime=${BUILD_TIME}'`
             -X 'main.GitBranch=${GIT_BRANCH}'`
             -X 'main.GoVersion=${GO_VERSION}'"

Write-Host "#: building executable file..."
$env:GOOS = "darwin"; $env:GOARCH = "amd64"; go build -ldflags $FLAGS -o $binPathAMD64 ./
$env:GOOS = "darwin"; $env:GOARCH = "arm64"; go build -ldflags $FLAGS -o $binPathARM64 ./
# Write-Host "#: compressing executable file..."
# upx $binPath
Write-Host "#: copying configs file..."
Copy-Item ./configstemplate.json $targetDir"configs.json"
Write-Host "#: done"

Set-Location ../../