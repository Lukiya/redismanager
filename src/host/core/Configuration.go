package core

import (
	"github.com/syncfuture/go/sconfig"
	"github.com/syncfuture/go/slog"
	"github.com/syncfuture/go/sredis"
)

type Configuration struct {
	Log        *slog.LogConfig
	Debug      bool
	ListenAddr string
}

func loadFromConfigProvider(cp sconfig.IConfigProvider) (r *Configuration) {
	cp.GetStruct("@this", &r)

	if r == nil {
		slog.Fatal("Invalid configuration file")
	}

	if r.ListenAddr == "" {
		r.ListenAddr = ":16379"
	}
	return
}

type RedisConfigX struct {
	ID   string
	Name string
	sredis.RedisConfig
}
