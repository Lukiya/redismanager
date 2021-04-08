package core

import (
	"github.com/Lukiya/redismanager/src/go/rmr"
	"github.com/syncfuture/go/sconfig"
	"github.com/syncfuture/host"
	"github.com/syncfuture/host/sfasthttp"
)

var (
	Manager *rmr.RedisManager
	Host    host.IWebHost
)

func init() {
	cp := sconfig.NewJsonConfigProvider()
	Host = sfasthttp.NewFHWebHost(cp)

	Manager = rmr.NewRedisManager()
}
