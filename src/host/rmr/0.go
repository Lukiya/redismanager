package rmr

import (
	"github.com/syncfuture/go/sredis"
)

type ClusterConfig struct {
	ID   string
	Name string
	sredis.RedisConfig
}
