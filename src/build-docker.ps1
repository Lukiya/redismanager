$targetDir = "./bin"
$binPath = $targetDir + "/redismanager.exe"
Write-Host "#: building binary executable file..."
go build -ldflags="-s -w" -o $binPath ./
Write-Host "#: compressing binary executable file..."
upx $binPath
#Copy-Item .\configs.json $targetDir