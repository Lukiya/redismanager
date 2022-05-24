package core

import (
	"github.com/Lukiya/redismanager/src/go/rmr"
	"github.com/syncfuture/go/sconfig"
	log "github.com/syncfuture/go/slog"
	"github.com/syncfuture/host"
	"github.com/syncfuture/host/sfasthttp"
)

var (
	Manager        *rmr.RedisManager
	Host           host.IWebHost
	ConfigProvider sconfig.IConfigProvider
)

func init() {
	ConfigProvider = sconfig.NewJsonConfigProvider()
	log.Init(ConfigProvider)
	host.ConfigHttpClient(ConfigProvider)
	Host = sfasthttp.NewFHWebHost(ConfigProvider)

	Manager = rmr.NewRedisManager()
}
