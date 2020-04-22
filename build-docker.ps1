# !!!!! Make sure ./build-linux.ps1 already executed without problem first

$imageName = "redismanager"
$targetDir = "./dist/docker"

if (Test-Path $targetDir) {
    Remove-Item $targetDir -Recurse
}
Copy-Item ./dist/linux $targetDir -Recurse
Copy-Item ./Dockerfile $targetDir

Write-Host "#: building docker image"
docker build -t $imageName $targetDir
Write-Host "#: exporting docker image..."
docker save $imageName -o $targetDir/$imageName.tar
Write-Host "#: clear temperary files..."
docker rmi $imageName
Remove-Item $targetDir/* -Exclude *.tar
Write-Host "#: done"