package io

import "github.com/syncfuture/go/spool"

var (
	_buffPool = spool.NewSyncBufferPool(1024)
)
