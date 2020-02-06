$imageName = "redismanager"
$targetDir = "../docker/"
$binPath = $targetDir + "main"

Write-Host "#: building js code..."
npm run build
Write-Host "#: generating js bin data..."
go-bindata ./dist/...
Write-Host "#: building executable file..."
$env:GOOS = "linux"; $env:GOARCH = "amd64"; go build -ldflags="-s -w" -o $binPath ./
Write-Host "#: compressing executable file..."
upx $binPath
Write-Host "#: removing container..."
docker rm -f $imageName
Write-Host "#: removing docker image..."
docker rmi $imageName
Write-Host "#: building docker image"
docker build -t $imageName $targetDir
Write-Host "#: exporting docker image..."
docker save $imageName -o M:\$imageName.tar
Write-Host "#: run image..."
docker run --name $imageName -d --restart always -p 16379:16379 $imageName
Write-Host "#: clear temperary files..."
Remove-Item ../docker/* -Include main
Write-Host "#: done"