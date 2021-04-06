package core

import (
	"github.com/Lukiya/redismanager/src/go/rmr"
	"github.com/syncfuture/go/sconfig"
	"github.com/syncfuture/host"
	"github.com/syncfuture/host/sfasthttp"
)

const (
	Version               = "v2.0.0"
	ContentTypeJson       = "application/json"
	ContentTypeJavascript = "application/javascript"
	ContentTypeTextHtml   = "text/html"
	RedisType_String      = "string"
	RedisType_Hash        = "hash"
	RedisType_List        = "list"
	RedisType_Set         = "set"
	RedisType_ZSet        = "zset"
	ZipIndicator0         = 48
	ZipIndicator1         = 49
	ZipIndicatorSeperator = 124
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
