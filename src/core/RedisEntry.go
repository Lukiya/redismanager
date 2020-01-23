package core

import (
	"github.com/go-redis/redis/v7"
	u "github.com/syncfuture/go/util"
)

type RedisEntry struct {
	Key    string
	Type   string
	TTL    int64
	Length uint64
}

func (x *RedisEntry) GetType(client redis.Cmdable) {
	x.Type = client.Type(x.Key).Val()
}

func (x *RedisEntry) GetTTL(client redis.Cmdable) {
	ttl := client.TTL(x.Key).Val().Seconds()
	if ttl < 0 {
		x.TTL = -1
	} else {
		x.TTL = int64(ttl)
	}
}

func (x *RedisEntry) GetLength(client redis.Cmdable) {
	var err error
	switch x.Type {
	case "hash":
		x.Length, err = client.HLen(x.Key).Uint64()
	case "string":
		x.Length, err = client.StrLen(x.Key).Uint64()
	case "list":
		x.Length, err = client.LLen(x.Key).Uint64()
	case "set":
		x.Length, err = client.SCard(x.Key).Uint64()
	case "zset":
		x.Length, err = client.ZCard(x.Key).Uint64()
	}
	u.LogError(err)
}

func NewRedisEntry(client redis.Cmdable, key string) (r *RedisEntry) {
	r = new(RedisEntry)
	r.Key = key
	r.GetType(client)
	r.GetLength(client)
	r.GetTTL(client)
	return r
}
