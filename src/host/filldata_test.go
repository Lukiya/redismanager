package main

import (
	"context"
	"fmt"
	"testing"

	"github.com/go-redis/redis/v8"
)

var (
	_clusterClient *redis.ClusterClient
)

func init() {
	_clusterClient = redis.NewClusterClient(&redis.ClusterOptions{
		Addrs: []string{
			"192.168.188.166:7000",
			"192.168.188.166:7001",
			"192.168.188.166:7002",
			"192.168.188.166:7003",
			"192.168.188.166:7004",
			"192.168.188.166:7005",
		},
	})
}
func TestClusterFillAllData(t *testing.T) {
	TestClusterFillString(t)
	TestClusterFillHash(t)
	TestClusterFillList(t)
	TestClusterFillSet(t)
	TestClusterFillZSet(t)
}

func TestClusterFillString(t *testing.T) {
	max := 513
	ctx := context.Background()
	pip := _clusterClient.Pipeline()
	for i := 0; i < max; i++ {
		key := fmt.Sprintf("STR_%05d", i)
		pip.Set(ctx, key, key, -1)
		// nativeClient.Del(key)
	}
	pip.Exec(ctx)
}

func TestClusterFillHash(t *testing.T) {
	max := 513
	mmax := 602
	ctx := context.Background()
	pip := _clusterClient.Pipeline()
	for i := 0; i < max; i++ {
		key := fmt.Sprintf("HASH_%05d", i)
		members := make([]interface{}, 0, 2*mmax)
		for j := 0; j < mmax; j++ {
			members = append(members, fmt.Sprintf("FIELD_%05d", j))
			members = append(members, fmt.Sprintf("VALUE_%05d", j))
		}

		pip.HSet(ctx, key, members)

		// nativeClient.Del(key)
	}
	pip.Exec(ctx)
}

func TestClusterFillList(t *testing.T) {
	max := 513
	mmax := 602
	ctx := context.Background()
	pip := _clusterClient.Pipeline()

	for i := 0; i < max; i++ {
		key := fmt.Sprintf("LIST_%05d", i)
		members := make([]interface{}, 0, mmax)
		for j := 0; j < mmax; j++ {
			members = append(members, fmt.Sprintf("VALUE_%05d", j))
		}

		pip.RPush(ctx, key, members)
		// pip.Del(ctx, key)
	}

	pip.Exec(ctx)
}

func TestClusterFillSet(t *testing.T) {
	max := 513
	mmax := 602
	ctx := context.Background()
	for i := 0; i < max; i++ {
		key := fmt.Sprintf("SET_%05d", i)
		members := make([]interface{}, 0, mmax)
		for j := 0; j < mmax; j++ {
			members = append(members, fmt.Sprintf("VALUE_%05d", j))
		}

		_clusterClient.SAdd(ctx, key, members)
	}
}

func TestClusterFillZSet(t *testing.T) {
	max := 513
	mmax := 602
	ctx := context.Background()
	pip := _clusterClient.Pipeline()

	for i := 0; i < max; i++ {
		key := fmt.Sprintf("ZSET_%05d", i)
		for j := 0; j < mmax; j++ {
			pip.ZAdd(ctx, key, &redis.Z{
				Score:  float64(j),
				Member: fmt.Sprintf("VALUE_%05d", j),
			})
		}

		// pip.Del(ctx, key)
	}

	pip.Exec(ctx)
}
