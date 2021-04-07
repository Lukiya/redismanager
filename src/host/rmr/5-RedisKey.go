package rmr

import (
	"context"
	"fmt"
	"sync"

	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/sconv"
	"github.com/syncfuture/go/serr"
	"github.com/syncfuture/go/u"
)

type RedisKey struct {
	Key    string
	Type   string
	TTL    int64
	Length uint64
	client redis.UniversalClient
}

func (x *RedisKey) getType(ctx context.Context) error {
	var err error
	x.Type, err = x.client.Type(ctx, x.Key).Result()
	return serr.WithStack(err)
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

func newRedisKey(client redis.UniversalClient, key string) (r *RedisKey, err error) {
	r = new(RedisKey)
	r.client = client
	r.Key = key
	ctx := context.Background()
	err = r.getType(ctx)
	if err != nil {
		return nil, err
	}

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

	return r, nil
}

func (x *RedisKey) GetValue(field string) (string, error) {
	ctx := context.Background()

	switch x.Type {
	case RedisType_String:
		v, err := x.client.Get(ctx, x.Key).Result()
		return v, serr.WithStack(err)
	case RedisType_Hash:
		v, err := x.client.HGet(ctx, x.Key, field).Result()
		return v, serr.WithStack(err)
	case RedisType_List:
		index := sconv.ToInt64(field)
		v, err := x.client.LIndex(ctx, x.Key, index).Result()
		return v, serr.WithStack(err)
	case RedisType_Set:
		return field, nil
	case RedisType_ZSet:
		_, err := x.client.ZScore(ctx, x.Key, field).Result()
		return field, serr.WithStack(err)
	default:
		return "", serr.New(fmt.Sprintf("'%s' with field '%s' is not supported", x.Type, field))
	}
}
