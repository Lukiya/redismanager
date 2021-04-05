package rmr

import (
	"context"
	"fmt"
	"sort"
	"strings"

	"github.com/go-redis/redis/v8"
)

type RedisCluster struct {
	ID       string
	Name     string
	Nodes    []*RedisNode
	config   *ClusterConfig
	Selected bool
}

func NewRedisCluster(config *ClusterConfig) (r *RedisCluster, err error) {
	r = &RedisCluster{
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

		err = clusterClient.ForEachMaster(ctx, func(innerCtx context.Context, client *redis.Client) error {
			node := NewClusterRedisNode(client.Options().Addr, client)
			r.Nodes = append(r.Nodes, node)
			return nil
		})

		// asc sorting
		sort.Slice(r.Nodes, func(i, j int) bool {
			return strings.Compare(r.Nodes[i].Addr, r.Nodes[j].Addr) < 0
		})

		for i, node := range r.Nodes {
			node.ID = fmt.Sprintf("%03d", i)
		}
	} else {
		// standalone mode
		node := NewStandaloneReidsNode(config.Addrs[0], config.Password)
		r.Nodes = append(r.Nodes, node)
	}

	return r, err
}

func (x *RedisCluster) GetNode(nodeID string) *RedisNode {
	for _, v := range x.Nodes {
		if v.ID == nodeID {
			return v
		}
	}

	return nil
}
