package rmr

import (
	"context"
	"time"

	"github.com/Lukiya/redismanager/src/go/common"
	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/sconv"
	"github.com/syncfuture/go/serr"
)

type RedisEntry struct {
	Key   string
	Type  string
	Field string
	Score float64
	Index int64
	Value string
	TTL   int64
}

func NewRedisEntry(key, elementKey string, client redis.UniversalClient) (*RedisEntry, error) {
	r := &RedisEntry{
		Key: key,
	}
	ctx := context.Background()
	var err error

	r.Type, err = client.Type(ctx, key).Result()
	if err != nil {
		return nil, serr.WithStack(err)
	}

	var ttl time.Duration
	ttl, err = client.TTL(ctx, key).Result()
	if err != nil {
		return nil, serr.WithStack(err)
	}
	ttlSeconds := ttl.Seconds()
	if ttlSeconds < 0 {
		r.TTL = -1
	} else {
		r.TTL = int64(ttlSeconds)
	}

	switch r.Type {
	case common.RedisType_String:
		r.Value, err = client.Get(ctx, key).Result()
		break
	case common.RedisType_Hash:
		r.Field = elementKey
		r.Value, err = client.HGet(ctx, key, elementKey).Result()
		break
	case common.RedisType_List:
		r.Index = sconv.ToInt64(elementKey)
		r.Value, err = client.LIndex(ctx, key, r.Index).Result()
		break
	case common.RedisType_Set:
		r.Value = elementKey
		break
	case common.RedisType_ZSet:
		r.Score, err = client.ZScore(ctx, key, elementKey).Result()
		r.Value = elementKey
		break
	}

	return r, serr.WithStack(err)
}
