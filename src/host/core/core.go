package core

import (
	"github.com/Lukiya/redismanager/src/go/rmr"
	"github.com/syncfuture/go/sconfig"
	log "github.com/syncfuture/go/slog"
	"github.com/syncfuture/host"
	"github.com/syncfuture/host/sfasthttp"
)

var (
	Manager *rmr.RedisManager
	Host    host.IWebHost
)

func init() {
	cp := sconfig.NewJsonConfigProvider()
	log.Init(cp)
	host.ConfigHttpClient(cp)
	Host = sfasthttp.NewFHWebHost(cp)

	Manager = rmr.NewRedisManager()
}
