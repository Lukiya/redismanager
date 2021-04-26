package rmr

import (
	"context"

	"github.com/Lukiya/redismanager/src/go/common"
	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/sconv"
	"github.com/syncfuture/go/serr"
	"github.com/syncfuture/go/u"
)

type RedisEntry struct {
	*RedisKey
	Field string
	Score float64
	Index int64
	Value string
}

func NewRedisEntry(key, elementKey string, client redis.UniversalClient) (*RedisEntry, error) {
	ctx := context.Background()
	var err error

	r := new(RedisEntry)
	r.RedisKey, err = newRedisKey(ctx, client, key)
	if err != nil {
		return nil, err
	}

	r.getValue(ctx, elementKey)

	return r, serr.WithStack(err)
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
