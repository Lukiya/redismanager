package rmr

import (
	"context"
	"sync"

	"github.com/Lukiya/redismanager/src/go/common"
	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/serr"
)

func NewStandaloneRedisDB(client *redis.Client, db int) IRedisDB {
	return &StandaloneRedisDB{
		DB:     db,
		id:     generateClientID(client),
		client: client,
	}
}

type StandaloneRedisDB struct {
	DB     int
	id     string
	client *redis.Client
}

func (x *StandaloneRedisDB) ScanKeys(query *ScanQuery) (map[string]*KeyQueryResult, error) {
	ctx := context.Background()

	locker := new(sync.Mutex)
	restuls := make(map[string]*KeyQueryResult, 1)

	err := scanKeys(ctx, locker, nil, &restuls, x.id, x.client, query)
	if err != nil {
		return nil, err
	}

	return restuls, nil
}

func (x *StandaloneRedisDB) ScanMoreKeys(queries map[string]*ScanQuery) (map[string]*KeyQueryResult, error) {
	ctx := context.Background()

	locker := new(sync.Mutex)
	results := make(map[string]*KeyQueryResult, len(queries))

	err := scanKeys(ctx, locker, nil, &results, x.id, x.client, queries[x.id])
	if err != nil {
		return nil, err
	}

	return results, nil
}

func (x *StandaloneRedisDB) GetAllKeys(query *ScanQuery) ([]*RedisKey, error) {
	var keys []*RedisKey

	m, err := x.ScanKeys(query)
	if err != nil {
		return nil, err
	}

	for _, v := range m {
		keys = append(keys, v.Keys...)
	}

	for len(m) > 0 {
		moreQueries := make(map[string]*ScanQuery, len(m))
		for i, v := range m {
			if v.Cursor > 0 {
				moreQueries[i] = &ScanQuery{
					Cursor:  uint64(v.Cursor),
					Keyword: query.Keyword,
				}
			}
		}
		if len(moreQueries) > 0 {
			m, err = x.ScanMoreKeys(moreQueries)
			if err != nil {
				return nil, err
			}
			for _, v := range m {
				keys = append(keys, v.Keys...)
			}
		} else {
			for k := range m {
				delete(m, k)
			}
		}
	}

	return keys, nil
}

func (x *StandaloneRedisDB) GetKey(key string) (*RedisKey, error) {
	return newRedisKey(context.Background(), x.client, key)
}

func (x *StandaloneRedisDB) GetElements(query *ScanQuerySet) (*ElementQueryResult, error) {
	if query.Type == "" {
		return nil, serr.New("type is missing")
	}

	ctx := context.Background()
	switch query.Type {
	case common.RedisType_Hash:
		r, err := getHashElements(ctx, x.client, query)
		return r, err
	case common.RedisType_List:
		r, err := getListElements(ctx, x.client, query)
		return r, err
	case common.RedisType_Set:
		r, err := getSetElements(ctx, x.client, query)
		return r, err
	case common.RedisType_ZSet:
		r, err := getZSetElements(ctx, x.client, query)
		return r, err
	default:
		return nil, serr.Errorf("key type '%s' is not supported", query.Type)
	}
}

func (x *StandaloneRedisDB) KeyExists(key string) (bool, error) {
	ctx := context.Background()
	count, err := x.client.Exists(ctx, key).Result()
	if err != nil {
		return false, serr.WithStack(err)
	}

	return count > 0, nil
}

func (x *StandaloneRedisDB) SaveValue(cmd *SaveRedisEntryCommand) error {
	ctx := context.Background()

	if cmd.IsNew {
		// Check if new key is existing
		exists, err := x.KeyExists(cmd.New.Key)
		if err != nil {
			return err
		}

		if exists {
			return common.KeyExistError
		}
	}

	// redisKey, err := x.GetKey(cmd.Old.Key)
	// if err != nil {
	// 	return err
	// }

	var err error
	switch cmd.New.Type {
	case common.RedisType_String:
		err = saveString(ctx, x.client, nil, cmd)
		break
	case common.RedisType_Hash:
		err = saveHash(ctx, x.client, nil, cmd)
		break
	case common.RedisType_List:
		err = saveList(ctx, x.client, nil, cmd)
		break
	case common.RedisType_Set:
		err = saveSet(ctx, x.client, nil, cmd)
		break
	case common.RedisType_ZSet:
		err = saveZSet(ctx, x.client, nil, cmd)
		break
	default:
		err = serr.Errorf("key type '%s' is not supported", cmd.New.Type)
		break
	}

	if err != nil {
		return err
	}

	////////// save TTL
	return saveTTL(ctx, x.client, nil, cmd)
}

func (x *StandaloneRedisDB) DeleteKey(key string) error {
	ctx := context.Background()
	return x.client.Del(ctx, key).Err()
}

func (x *StandaloneRedisDB) DeleteElement(key, element string) error {
	ctx := context.Background()

	redisKey, err := x.GetKey(key)
	if err != nil {
		return err
	}

	switch redisKey.Type {
	case common.RedisType_Hash:
		err = delHash(ctx, x.client, nil, key, element)
		break
	case common.RedisType_List:
		err = delList(ctx, x.client, nil, key, element)
		break
	case common.RedisType_Set:
		err = delSet(ctx, x.client, nil, key, element)
		break
	case common.RedisType_ZSet:
		err = delZSet(ctx, x.client, nil, key, element)
		break
	default:
		err = serr.Errorf("key type '%s' is not supported", redisKey.Type)
		break
	}

	return err
}
