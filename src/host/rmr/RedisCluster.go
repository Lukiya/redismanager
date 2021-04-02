package rmr

type RedisCluster struct {
	Nodes  []*RedisNode
	config *ClusterConfig
}

func NewRedisCluster(config *ClusterConfig) *RedisCluster {
	r := &RedisCluster{
		config: config,
	}

	for _, addr := range config.Addrs {
		node := NewRedisNode(addr, config.Password)
		r.Nodes = append(r.Nodes, node)
	}

	return r
}
