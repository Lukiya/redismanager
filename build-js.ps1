Set-Location ./src/gui

Write-Host "#: building js code..."
yarn build
Write-Host "#: generating js bin data..."
go-bindata -o ../../src/host/bindata.go ./dist/...
Write-Host "#: done"

Set-Location ../../