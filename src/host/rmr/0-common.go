package rmr

import (
	"context"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/serr"
	"github.com/syncfuture/go/sredis"
)

type ServerConfig struct {
	ID       string
	Name     string
	Selected bool
	sredis.RedisConfig
}

type KeyQuery struct {
	Cursor uint64
	Count  int64
	Match  string
}

type KeyQueryResult struct {
	Cursor uint64
	Keys   []*RedisKey
}

type SaveRedisEntryCommand struct {
	New   *RedisEntry `json:"new"`
	Old   *RedisEntry `json:"old"`
	IsNew bool
}
type RedisEntry struct {
	Key   string
	Type  string
	Field string
	Value string
	TTL   int64
}

func saveTTL(ctx context.Context, client redis.UniversalClient, cmd *SaveRedisEntryCommand) (err error) {
	if cmd.New.TTL != cmd.Old.TTL {
		// Need update ttl
		if cmd.New.TTL > 0 {
			err = client.Expire(ctx, cmd.New.Key, time.Duration(cmd.New.TTL)*time.Second).Err()
			if err != nil {
				return serr.WithStack(err)
			}
		} else {
			err = client.Persist(ctx, cmd.New.Key).Err()
			if err != nil {
				return serr.WithStack(err)
			}
		}
	}
	return
}
