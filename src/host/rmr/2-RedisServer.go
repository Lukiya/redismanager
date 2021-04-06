package rmr

import (
	"context"
	"fmt"
	"sort"
	"strings"
	"sync"

	"github.com/go-redis/redis/v8"
)

type RedisServer struct {
	ID       string
	Name     string
	Nodes    []*RedisNode
	config   *ServerConfig
	Selected bool
}

func NewRedisServer(config *ServerConfig) (r *RedisServer, err error) {
	r = &RedisServer{
		ID:       config.ID,
		Name:     config.Name,
		config:   config,
		Selected: config.Selected,
	}
	ctx := context.Background()
	var ServerClient *redis.ClusterClient
	if len(config.Addrs) > 1 {
		// Server mode
		ServerClient = redis.NewClusterClient(&redis.ClusterOptions{
			Addrs:    config.Addrs,
			Password: config.Password,
		})

		locker := new(sync.Mutex)
		err = ServerClient.ForEachMaster(ctx, func(innerCtx context.Context, client *redis.Client) error {
			node := NewServerRedisNode(client.Options().Addr, client)
			locker.Lock()
			r.Nodes = append(r.Nodes, node)
			locker.Unlock()
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

func (x *RedisServer) GetNode(nodeID string) *RedisNode {
	for _, v := range x.Nodes {
		if v.ID == nodeID {
			return v
		}
	}

	return nil
}
