package rmr

import (
	"context"
	"runtime"

	"github.com/Lukiya/redismanager/src/go/common"
	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/serr"
	"github.com/syncfuture/go/stask"
	"github.com/syncfuture/go/u"
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
	if len(keys) < int(query.Count) && cur > 0 {
		// if return keys is less than count limit, but has cursor
		var leftKeys []string
		// then keep read left keys
		leftKeys, cur, err = x.client.Scan(context.Background(), cur, query.Match, query.Count).Result()
		// and append it to results
		keys = append(keys, leftKeys...)
	}

	r.Keys = x.stringKeysToRedisKeys(keys)
	r.Cursor = cur
	return r, err
}

func (x *RedisDB) GetKey(key string) (*RedisKey, error) {
	redisKey, err := newRedisKey(x.client, key)
	if err != nil {
		return nil, err
	}
	return redisKey, nil
}

func (x *RedisDB) SaveValue(cmd *SaveRedisEntryCommand) error {
	ctx := context.Background()

	if cmd.IsNew {
		// Check if new key is existing
		exists, err := x.keyExists(cmd.New.Key)
		if err != nil {
			return err
		}

		if exists {
			return common.KeyExistError
		}
	}

	redisKey, err := x.GetKey(cmd.Old.Key)
	if err != nil {
		return err
	}

	switch redisKey.Type {
	case common.RedisType_String:
		err = saveString(ctx, x.client, cmd)
		break
	case common.RedisType_Hash:
		err = saveHash(ctx, x.client, cmd)
		break
	case common.RedisType_List:
		err = saveList(ctx, x.client, cmd)
		break
	case common.RedisType_Set:
		err = saveSet(ctx, x.client, cmd)
		break
	case common.RedisType_ZSet:
		err = saveZSet(ctx, x.client, cmd)
		break
	default:
		err = serr.Errorf("key type '%s' is not supported", redisKey.Type)
		break
	}

	if err != nil {
		return err
	}

	////////// save TTL
	err = saveTTL(ctx, x.client, cmd)
	if err != nil {
		return err
	}

	return nil
}

func (x *RedisDB) keyExists(keys ...string) (bool, error) {
	ctx := context.Background()
	count, err := x.client.Exists(ctx, keys...).Result()
	if err != nil {
		return false, serr.WithStack(err)
	}

	return count > 0, nil
}

// stringKeysToRedisKeys conver string key to redis key
func (x *RedisDB) stringKeysToRedisKeys(keys []string) []*RedisKey {
	r := make([]*RedisKey, len(keys))

	f := stask.NewFlowScheduler(runtime.NumCPU())

	f.SliceRun(&keys, func(i int, v interface{}) {
		redisKey, err := newRedisKey(x.client, v.(string))
		if u.LogError(err) {
			return
		}
		r[i] = redisKey
	})

	return r
}
