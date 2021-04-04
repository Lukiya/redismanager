package rmr

import (
	"context"

	"github.com/go-redis/redis/v8"
)

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
	ctx := context.Background()
	var clusterClient *redis.ClusterClient
	if len(config.Addrs) > 1 {
		// cluster mode
		clusterClient = redis.NewClusterClient(&redis.ClusterOptions{
			Addrs:    config.Addrs,
			Password: config.Password,
		})

		clusterClient.ForEachMaster(ctx, func(innerCtx context.Context, client *redis.Client) error {
			node := NewClusterRedisNode(client.Options().Addr, client)
			r.Nodes = append(r.Nodes, node)
			return nil
		})
	} else {
		// standalone mode
		node := NewStandaloneReidsNode(config.Addrs[0], config.Password)
		r.Nodes = append(r.Nodes, node)
	}

	return r
}