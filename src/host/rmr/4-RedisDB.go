package rmr

import (
	"context"
	"runtime"

	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/serr"
	"github.com/syncfuture/go/stask"
	"github.com/syncfuture/host"
)

type RedisDB struct {
	client redis.UniversalClient
	ID     string
	DB     int
	// Keys          []string
	// scanKeyCursor int64
}

// func NewRedisDB(db int, addr, pwd string) *RedisDB {
func NewRedisDB(db int, client redis.UniversalClient) *RedisDB {
	r := &RedisDB{
		ID:     host.GenerateID(),
		DB:     db,
		client: client,
		// client: redis.NewClient(&redis.Options{
		// 	Addr:     addr,
		// 	Password: pwd,
		// 	DB:       db,
		// }),
		// scanKeyCursor: -1,
	}
	return r
}

func (x *RedisDB) Client() redis.UniversalClient {
	return x.client
}

func (x *RedisDB) GetKeys(query *KeyQuery) (*KeyQueryResult, error) {
	r := new(KeyQueryResult)
	keys, cur, err := x.client.Scan(context.Background(), query.Cursor, query.Match, query.Count).Result()
	if err != nil {
		return nil, serr.WithStack(err)
	}
	r.Keys = x.convert(keys)
	r.Cursor = cur
	return r, err
}

func (x *RedisDB) convert(keys []string) []*RedisKey {
	r := make([]*RedisKey, len(keys))

	f := stask.NewFlowScheduler(runtime.NumCPU())

	f.SliceRun(&keys, func(i int, v interface{}) {
		r[i] = NewRedisEntry(x.client, v.(string))
	})

	return r
}
