package rmr

import (
	"context"
	"sync"

	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/u"
)

type RedisKey struct {
	Key    string
	Type   string
	TTL    int64
	Length uint64
	client redis.UniversalClient
}

func (x *RedisKey) getType(ctx context.Context) {
	var err error
	x.Type, err = x.client.Type(ctx, x.Key).Result()
	u.LogError(err)
}

func (x *RedisKey) getTTL(ctx context.Context) {
	ttl, err := x.client.TTL(ctx, x.Key).Result()
	if u.LogError(err) {
		x.TTL = -1
		return
	}

	ttlSeconds := ttl.Seconds()
	if ttlSeconds < 0 {
		x.TTL = -1
	} else {
		x.TTL = int64(ttlSeconds)
	}
}

func (x *RedisKey) getLength(ctx context.Context) {
	var err error
	switch x.Type {
	case RedisType_String:
		x.Length, err = x.client.StrLen(ctx, x.Key).Uint64()
		break
	case RedisType_Hash:
		x.Length, err = x.client.HLen(ctx, x.Key).Uint64()
		break
	case RedisType_List:
		x.Length, err = x.client.LLen(ctx, x.Key).Uint64()
		break
	case RedisType_Set:
		x.Length, err = x.client.SCard(ctx, x.Key).Uint64()
		break
	case RedisType_ZSet:
		x.Length, err = x.client.ZCard(ctx, x.Key).Uint64()
		break
	}
	u.LogError(err)
}

func NewRedisEntry(client redis.UniversalClient, key string) (r *RedisKey) {
	r = new(RedisKey)
	r.client = client
	r.Key = key
	ctx := context.Background()
	r.getType(ctx)

	wg := sync.WaitGroup{}
	wg.Add(2)
	go func() {
		defer func() { wg.Done() }()
		r.getLength(ctx)
	}()
	go func() {
		defer func() { wg.Done() }()
		r.getTTL(ctx)
	}()
	wg.Wait()

	return r
}
