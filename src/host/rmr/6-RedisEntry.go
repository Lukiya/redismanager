package rmr

import (
	"context"
	"sync"

	"github.com/Lukiya/redismanager/src/go/common"
	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/sconv"
	"github.com/syncfuture/go/serr"
	"github.com/syncfuture/go/u"
)

type RedisEntry struct {
	Key    string
	Type   string
	Field  string
	Score  float64
	Index  int64
	Value  string
	TTL    int64
	Length uint64
	client redis.UniversalClient
}

func NewRedisEntry(key, elementKey string, client redis.UniversalClient) (*RedisEntry, error) {
	r := &RedisEntry{
		Key:    key,
		client: client,
	}
	ctx := context.Background()

	err := r.getType(ctx)
	if err != nil {
		return nil, serr.WithStack(err)
	}

	wg := sync.WaitGroup{}
	wg.Add(3)
	go func() {
		defer func() { wg.Done() }()
		r.getLength(ctx)
	}()
	go func() {
		defer func() { wg.Done() }()
		r.getTTL(ctx)
	}()
	go func() {
		defer func() { wg.Done() }()
		r.getValue(ctx, elementKey)
	}()
	wg.Wait()

	return r, serr.WithStack(err)
}

func (x *RedisEntry) getType(ctx context.Context) error {
	var err error
	x.Type, err = x.client.Type(ctx, x.Key).Result()
	return serr.WithStack(err)
}

func (x *RedisEntry) getTTL(ctx context.Context) {
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

func (x *RedisEntry) getLength(ctx context.Context) {
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

func (x *RedisEntry) getValue(ctx context.Context, elementKey string) {
	var err error
	switch x.Type {
	case common.RedisType_String:
		x.Value, err = x.client.Get(ctx, x.Key).Result()
		break
	case common.RedisType_Hash:
		if elementKey != "" {
			x.Field = elementKey
			x.Value, err = x.client.HGet(ctx, x.Key, elementKey).Result()
		}

		break
	case common.RedisType_List:
		if elementKey != "" {
			x.Index = sconv.ToInt64(elementKey)
			x.Value, err = x.client.LIndex(ctx, x.Key, x.Index).Result()
		}
		break
	case common.RedisType_Set:
		if elementKey != "" {
			x.Value = elementKey
		}
		break
	case common.RedisType_ZSet:
		if elementKey != "" {
			x.Score, err = x.client.ZScore(ctx, x.Key, elementKey).Result()
			x.Value = elementKey
		}
		break
	}

	u.LogError(err)
}
