package rmr

import (
	"context"
	"fmt"
	"sync/atomic"
	"testing"

	"github.com/go-redis/redis/v8"
	"github.com/stretchr/testify/assert"
	log "github.com/syncfuture/go/slog"
)

var (
	_rm           *RedisManager
	_nativeClient *redis.ClusterClient
)

func init() {
	_nativeClient = redis.NewClusterClient(&redis.ClusterOptions{
		Addrs: []string{
			"192.168.188.166:7000",
			"192.168.188.166:7001",
			"192.168.188.166:7002",
			"192.168.188.166:7003",
			"192.168.188.166:7004",
			"192.168.188.166:7005",
		},
	})
	_rm = NewRedisManager()
}

func TestFillString(t *testing.T) {
	max := 513
	ctx := context.Background()
	for i := 0; i < max; i++ {
		key := fmt.Sprintf("STR_%05d", i)
		_nativeClient.Set(ctx, key, key, -1)
		// nativeClient.Del(key)
	}
}

func TestFillHash(t *testing.T) {
	max := 513
	mmax := 602
	ctx := context.Background()
	for i := 0; i < max; i++ {
		key := fmt.Sprintf("HASH_%05d", i)
		members := make([]interface{}, 0, 2*mmax)
		for j := 0; j < mmax; j++ {
			members = append(members, fmt.Sprintf("FIELD_%05d", j))
			members = append(members, fmt.Sprintf("VALUE_%05d", j))
		}

		_nativeClient.HSet(ctx, key, members)

		// nativeClient.Del(key)
	}
}

func TestFillList(t *testing.T) {
	max := 513
	mmax := 602
	ctx := context.Background()
	pip := _nativeClient.Pipeline()

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

func TestFillSet(t *testing.T) {
	max := 513
	mmax := 602
	ctx := context.Background()
	for i := 0; i < max; i++ {
		key := fmt.Sprintf("SET_%05d", i)
		members := make([]interface{}, 0, mmax)
		for j := 0; j < mmax; j++ {
			members = append(members, fmt.Sprintf("VALUE_%05d", j))
		}

		_nativeClient.SAdd(ctx, key, members)
	}
}

func TestFillZSet(t *testing.T) {
	max := 513
	mmax := 602
	ctx := context.Background()
	pip := _nativeClient.Pipeline()

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

func TestGetKeys(t *testing.T) {
	// a := _nativeClient.Keys(context.Background(), "*").Val()
	// log.Info(len(a))
	ctx := context.Background()
	// a, err := _nativeClient.ServerSlots(ctx).Result()
	// a, err := _nativeClient.Keys(ctx, "*").Result()
	// log.Info(len(a), err)
	// b, err := _nativeClient.Info(ctx, "keyspace").Result()
	// log.Info(b, err)

	// _nativeClient.

	client := redis.NewClient(&redis.Options{Addr: "localhost:6380"})
	c, err := client.ConfigGet(ctx, "databases").Result()
	log.Info(c, err)
}

func TestSaveAndRemoveServer(t *testing.T) {
	sc := new(ServerConfig)
	sc.Addrs = []string{
		"192.168.188.166:7000",
		"192.168.188.166:7001",
		"192.168.188.166:7002",
		"192.168.188.166:7003",
		"192.168.188.166:7004",
		"192.168.188.166:7005",
	}
	err := _rm.Save(sc)
	assert.NoError(t, err)
	err = _rm.Remove(sc.ID)
	assert.NoError(t, err)
}

func TestServer(t *testing.T) {
	Server := _rm.GetSelectedServer()
	assert.NotNil(t, Server)

	keyCount := int64(0)
	// ctx := context.Background()

	for _, node := range Server.Nodes {
		dbs, err := node.GetDBs()
		if !assert.NoError(t, err) {
			break
		}

		for _, db := range dbs {
			// a := db.client.Keys(ctx, "*").Val()
			// log.Info("---", len(a))

			rs, err := db.GetKeys(&KeysQuery{
				Cursor: 0,
				Match:  "*",
				Count:  5,
			})

			if !assert.NoError(t, err) {
				break
			}
			log.Info("---", len(rs.Keys))
			atomic.AddInt64(&keyCount, int64(len(rs.Keys)))
		}
	}

	log.Info(keyCount)
}
