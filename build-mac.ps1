Set-Location ./src/host

$imageName = "redismanager"
$targetDir = "../../dist/mac/"
$binPathAMD64 = $targetDir + $imageName + "_amd64"
$binPathARM64 = $targetDir + $imageName + "_arm64"

Write-Host "#: building executable file..."
$env:GOOS = "darwin"; $env:GOARCH = "amd64"; go build -ldflags="-s -w" -o $binPathAMD64 ./
$env:GOOS = "darwin"; $env:GOARCH = "arm64"; go build -ldflags="-s -w" -o $binPathARM64 ./
# Write-Host "#: compressing executable file..."
# upx $binPath
Write-Host "#: copying configs file..."
Copy-Item ./configstemplate.json $targetDir"configs.json"
Write-Host "#: done"

Set-Location ../../