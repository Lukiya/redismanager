package core

import (
	"strings"

	"github.com/syncfuture/go/sconfig"
	log "github.com/syncfuture/go/slog"
	"github.com/syncfuture/host"
	"github.com/syncfuture/host/sfasthttp"
)

const (
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
	_cp     sconfig.IConfigProvider
	Configs *Configuration
	Manager *ServerManager
	Host    host.IWebHost
)

func init() {
	_cp = sconfig.NewJsonConfigProvider()
	log.Init(_cp)
	Configs = loadFromConfigProvider(_cp)
	Configs.Log = log.Config

	Manager = NewServerManager()

	Host = sfasthttp.NewFHWebHost(_cp)
}
func IsJson(str string) bool {
	if str == "" {
		return false
	}

	str = strings.TrimSpace(str)

	return strings.HasPrefix(str, "{") && strings.HasSuffix(str, "}")
}
