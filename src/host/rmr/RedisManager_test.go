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

func TestFillData(t *testing.T) {
	max := 3513
	for i := 0; i < max; i++ {
		key := fmt.Sprintf("STR_%05d", i)
		_nativeClient.Set(context.Background(), key, key, -1)
		// nativeClient.Del(key)
	}
}

func TestGetKeys(t *testing.T) {
	// a := _nativeClient.Keys(context.Background(), "*").Val()
	// log.Info(len(a))
	ctx := context.Background()
	// a, err := _nativeClient.ClusterSlots(ctx).Result()
	// a, err := _nativeClient.Keys(ctx, "*").Result()
	// log.Info(len(a), err)
	// b, err := _nativeClient.Info(ctx, "keyspace").Result()
	// log.Info(b, err)

	// _nativeClient.

	client := redis.NewClient(&redis.Options{Addr: "localhost:6380"})
	c, err := client.ConfigGet(ctx, "databases").Result()
	log.Info(c, err)
}

func TestSaveAndRemoveCluster(t *testing.T) {
	sc := new(ClusterConfig)
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

func TestCluster(t *testing.T) {
	cluster := _rm.GetSelectedCluster()
	assert.NotNil(t, cluster)

	keyCount := int64(0)
	// ctx := context.Background()

	for _, node := range cluster.Nodes {
		dbs, err := node.GetDBs()
		if !assert.NoError(t, err) {
			break
		}

		for _, db := range dbs {
			// a := db.client.Keys(ctx, "*").Val()
			// log.Info("---", len(a))

			rs, err := db.GetKeys(&KeysQuery{
				Cursor:   0,
				Match:    "*",
				PageSize: 5,
			})

			if !assert.NoError(t, err) {
				break
			}
			log.Info("---", len(rs.Entries))
			atomic.AddInt64(&keyCount, int64(len(rs.Entries)))
		}
	}

	log.Info(keyCount)
}
