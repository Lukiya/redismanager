package rmr

import (
	"context"
	"fmt"
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
	max := 513
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

	node := cluster.Nodes[0]
	dbs, err := node.GetDBs()
	assert.NoError(t, err)

	for _, db := range dbs {
		keys, cur, err := db.GetKeys(0, "*", 100)
		if !assert.NoError(t, err) {
			break
		}

		log.Info(db.ID, keys, cur, err)
	}
}
