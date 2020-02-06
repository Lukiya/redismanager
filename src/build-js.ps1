Write-Host "#: building js code..."
npm run build
Write-Host "#: generating js bin data..."
go-bindata ./dist/...
Write-Host "#: done"