package rmr

import (
	"context"
	"strconv"
	"sync"

	"github.com/Lukiya/redismanager/src/go/common"
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
	case common.RedisType_String:
		v, err := x.client.Get(ctx, x.Key).Result()
		return v, serr.WithStack(err)
	case common.RedisType_Hash:
		v, err := x.client.HGet(ctx, x.Key, field).Result()
		return v, serr.WithStack(err)
	case common.RedisType_List:
		index, err := strconv.ParseInt(field, 10, 64)
		if err != nil {
			return "", serr.WithStack(err)
		}
		v, err := x.client.LIndex(ctx, x.Key, index).Result()
		return v, serr.WithStack(err)
	case common.RedisType_Set:
		return field, nil
	case common.RedisType_ZSet:
		v, err := x.client.ZScore(ctx, x.Key, field).Result()
		return sconv.ToString(v), serr.WithStack(err)
	default:
		return "", serr.Errorf("'%s' with field '%s' is not supported", x.Type, field)
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
	case common.RedisType_String:
		x.Length, err = x.client.StrLen(ctx, x.Key).Uint64()
		break
	case common.RedisType_Hash:
		x.Length, err = x.client.HLen(ctx, x.Key).Uint64()
		break
	case common.RedisType_List:
		x.Length, err = x.client.LLen(ctx, x.Key).Uint64()
		break
	case common.RedisType_Set:
		x.Length, err = x.client.SCard(ctx, x.Key).Uint64()
		break
	case common.RedisType_ZSet:
		x.Length, err = x.client.ZCard(ctx, x.Key).Uint64()
		break
	}
	u.LogError(err)
}
