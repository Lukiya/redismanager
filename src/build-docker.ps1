$imageName = "redismanager"
$targetDir = "../dist/docker/"
$binPath = $targetDir + "main"

# Write-Host "#: building js code..."
# npm run build
# Write-Host "#: generating js bin data..."
# go-bindata ./dist/...
Write-Host "#: building executable file..."
$env:GOOS = "linux"; $env:GOARCH = "amd64"; go build -ldflags="-s -w" -o $binPath ./
Write-Host "#: compressing executable file..."
upx $binPath
Write-Host "#: deploying files..."
Copy-Item ./configstemplate.json $targetDir"configs.json"
Copy-Item ./Dockerfile $targetDir
Write-Host "#: building docker image"
docker build -t $imageName $targetDir
Write-Host "#: exporting docker image..."
docker save $imageName -o $targetDir$imageName.tar
Write-Host "#: removing docker image..."
docker rmi $imageName
Write-Host "#: clear temperary files..."
Remove-Item $targetDir/* -Exclude *.tar
Write-Host "#: done"