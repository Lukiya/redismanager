# !!!!! Make sure ./build-docker.ps1 already executed without problem first

$imageName = "redismanager"
$targetDir = "./dist/docker"

Write-Host "#: loading docker image"
docker load -i $targetDir/$imageName.tar
docker tag redismanager lukiya/$imageName
Write-Host "#: pushing docker image"
docker push lukiya/$imageName
Write-Host "#: clear temperary files..."
docker rmi lukiya/$imageName
docker rmi $imageName
Write-Host "#: done"