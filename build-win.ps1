Set-Location ./src/host

$imageName = "redismanager.exe"
$targetDir = "../../dist/win/"
$binPath = $targetDir + $imageName

Write-Host "#: building executable file..."
$env:GOOS = "windows"; $env:GOARCH = "amd64"; go build -ldflags="-s -w" -o $binPath ./
Write-Host "#: compressing executable file..."
upx $binPath
Write-Host "#: copying configs file..."
Copy-Item ./configstemplate.json $targetDir"configs.json"
Write-Host "#: done"

Set-Location ../../