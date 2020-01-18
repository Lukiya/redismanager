$targetDir = "../dist"

$binPath = $targetDir + "/rm-win64.exe"
Write-Host "#: building windows binary executable file..."
$env:GOOS = "windows"; $env:GOARCH = "amd64"; go build -ldflags="-s -w" -o $binPath ./
Write-Host "#: compressing windows binary executable file..."
upx $binPath

$binPath = $targetDir + "/rm-linux64"
Write-Host "#: building linux binary executable file..."
$env:GOOS = "linux"; $env:GOARCH = "amd64"; go build -ldflags="-s -w" -o $binPath ./
Write-Host "#: compressing linux binary executable file..."
upx $binPath

$binPath = $targetDir + "/rm-mac64"
Write-Host "#: building mac binary executable file..."
$env:GOOS = "darwin"; $env:GOARCH = "amd64"; go build -ldflags="-s -w" -o $binPath ./