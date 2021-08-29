Set-Location ./src/host

$binName = "redismanager.exe"
$targetDir = "../../dist/win/"
$binPath = $targetDir + $binName

$APP_NAME = "Redis Manager"
$APP_VERSION = $(git describe --tags --abbrev=0)
$BUILD_VERSION = $(git log -1 --oneline)
$BUILD_TIME=$(Get-Date -Format "UTCK = yyyy-MM-dd HH:mm:ss")
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

# Write-Host "#: building executable file..."
$env:GOOS = "windows"; $env:GOARCH = "amd64"; go build -ldflags $FLAGS -o $binPath ./
# Write-Host "#: compressing executable file..."
# upx $binPath
# Write-Host "#: copying configs file..."
Copy-Item ./configstemplate.json $targetDir"configs.json"
Write-Host "#: done"

Set-Location ../../