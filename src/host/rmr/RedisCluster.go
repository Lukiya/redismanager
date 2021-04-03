package rmr

type RedisCluster struct {
	ID       string
	Name     string
	Nodes    []*RedisNode
	config   *ClusterConfig
	Selected bool
}

func NewRedisCluster(config *ClusterConfig) *RedisCluster {
	r := &RedisCluster{
		ID:       config.ID,
		Name:     config.Name,
		config:   config,
		Selected: config.Selected,
	}

	for _, addr := range config.Addrs {
		node := NewRedisNode(addr, config.Password)
		r.Nodes = append(r.Nodes, node)
	}

	return r
}
