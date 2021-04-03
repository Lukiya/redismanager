package rmr

import (
	"fmt"
	"testing"

	"github.com/go-redis/redis/v7"
	"github.com/stretchr/testify/assert"
)

var (
	_rm *RedisManager
)

func init() {
	_rm = NewRedisManager()
}

func TestFillData(t *testing.T) {
	nativeClient := redis.NewClient(&redis.Options{
		Addr: "192.168.188.166:6380",
		DB:   0,
	})

	max := 513
	for i := 0; i < max; i++ {
		key := fmt.Sprintf("STR_%05d", i)
		nativeClient.Set(key, key, -1)
		// nativeClient.Del(key)
	}
}

func TestSaveAndRemoveCluster(t *testing.T) {
	sc := new(ClusterConfig)
	sc.Addrs = []string{"192.168.188.166:6380"}
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

	t.Log(dbs[0].GetKeys(0, "*", 10))
}
