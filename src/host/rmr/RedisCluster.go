package rmr

type RedisCluster struct {
	// ID     string
	// Name   string
	Nodes  map[string]*RedisNode
	config *ClusterConfig
}

func NewRedisCluster(config *ClusterConfig) *RedisCluster {
	r := &RedisCluster{
		config: config,
		// ID:     config.ID,
		// Name:   config.Name,
		Nodes: make(map[string]*RedisNode),
	}

	for _, addr := range config.Addrs {
		node := NewRedisNode(addr, config.Password)
		// r.Nodes = append(r.Nodes, node)
		r.Nodes[node.Addr] = node
	}

	return r
}
