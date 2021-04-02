package rmr

import (
	"github.com/syncfuture/go/sredis"
)

type RedisManager struct {
	Nodes  []*RedisNode
	config *sredis.RedisConfig
}

func NewRedisManager(config *sredis.RedisConfig) (*RedisManager, error) {
	r := &RedisManager{
		config: config,
	}

	for _, addr := range config.Addrs {
		node, err := NewRedisNode(addr, config.Password)
		if err != nil {
			return nil, err
		}
		r.Nodes = append(r.Nodes, node)
	}

	return r, nil
}
