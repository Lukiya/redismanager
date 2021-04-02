package rmr

import (
	"fmt"
	"testing"

	"github.com/go-redis/redis/v7"
	"github.com/syncfuture/go/sredis"
	"github.com/syncfuture/go/u"
)

var (
	_sc *sredis.RedisConfig
	_rm *RedisManager
)

func init() {
	_sc = &sredis.RedisConfig{
		Addrs: []string{"192.168.188.166:6380"},
	}

	var err error
	_rm, err = NewRedisManager(_sc)
	u.LogFaltal(err)
}

func TestFillData(t *testing.T) {
	nativeClient := redis.NewClient(&redis.Options{
		Addr: _sc.Addrs[0],
		DB:   0,
	})

	max := 513
	for i := 0; i < max; i++ {
		key := fmt.Sprintf("STR_%05d", i)
		nativeClient.Set(key, key, -1)
		// nativeClient.Del(key)
	}
}

// func TestLoadKeys(t *testing.T) {
// 	db := _rm.Nodes[0].DBs[0]
// 	db.LoadAllKeys()

// 	assert.Len(t, db.Keys, 513)
// }

func TestGetKeys(t *testing.T) {
	db := _rm.Nodes[0].DBs[0]
	t.Log(db.GetKeys(0, "*64", 100))
}
