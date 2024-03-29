package rmr

import (
	"context"
	"strconv"
	"sync"

	"github.com/Lukiya/redismanager/src/go/shared"
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

func newRedisKey(ctx context.Context, client redis.UniversalClient, key string) (r *RedisKey, err error) {
	r = new(RedisKey)
	r.client = client
	r.Key = key

	err = r.getType(ctx)
	if err != nil {
		return nil, err
	}

	wg := _wgPool.Get().(*sync.WaitGroup)
	defer func() {
		_wgPool.Put(wg)
	}()
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

func (x *RedisKey) GetValue(elementKey string) (string, error) {
	ctx := context.Background()

	switch x.Type {
	case shared.RedisType_String:
		v, err := x.client.Get(ctx, x.Key).Result()
		return v, serr.WithStack(err)
	case shared.RedisType_Hash:
		v, err := x.client.HGet(ctx, x.Key, elementKey).Result()
		return v, serr.WithStack(err)
	case shared.RedisType_List:
		index, err := strconv.ParseInt(elementKey, 10, 64)
		if err != nil {
			return "", serr.WithStack(err)
		}
		v, err := x.client.LIndex(ctx, x.Key, index).Result()
		return v, serr.WithStack(err)
	case shared.RedisType_Set:
		return elementKey, nil
	case shared.RedisType_ZSet:
		v, err := x.client.ZScore(ctx, x.Key, elementKey).Result()
		return sconv.ToString(v), serr.WithStack(err)
	default:
		return "", serr.Errorf("'%s' with field '%s' is not supported", x.Type, elementKey)
	}
}

func (x *RedisKey) getType(ctx context.Context) error {
	var err error
	x.Type, err = x.client.Type(ctx, x.Key).Result()
	return serr.WithStack(err)
}

func (x *RedisKey) getTTL(ctx context.Context) {
	ttl, err := x.client.TTL(ctx, x.Key).Result()
	if u.LogError(err) {
		x.TTL = 0
		return
	}

	ttlSeconds := ttl.Seconds()
	if ttlSeconds < 0 {
		x.TTL = 0
	} else {
		x.TTL = int64(ttlSeconds)
	}
}

func (x *RedisKey) getLength(ctx context.Context) {
	var err error
	switch x.Type {
	case shared.RedisType_String:
		x.Length, err = x.client.StrLen(ctx, x.Key).Uint64()
		break
	case shared.RedisType_Hash:
		x.Length, err = x.client.HLen(ctx, x.Key).Uint64()
		break
	case shared.RedisType_List:
		x.Length, err = x.client.LLen(ctx, x.Key).Uint64()
		break
	case shared.RedisType_Set:
		x.Length, err = x.client.SCard(ctx, x.Key).Uint64()
		break
	case shared.RedisType_ZSet:
		x.Length, err = x.client.ZCard(ctx, x.Key).Uint64()
		break
	}
	u.LogError(err)
}
