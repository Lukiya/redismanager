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

func (x *StandaloneRedisDB) ScanKeys(querySet *ScanQuerySet) (*ScanKeyResult, error) {
	ctx := context.Background()

	locker := new(sync.Mutex)
	result := &ScanKeyResult{
		Cursors: make(map[string]uint64, 1),
		Keys:    make([]*RedisKey, 0),
	}

	err := scanKeys(ctx, locker, nil, result, x.id, x.client, querySet.Query)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func (x *StandaloneRedisDB) ScanMoreKeys(querySet *ScanQuerySet) (*ScanKeyResult, error) {
	ctx := context.Background()

	locker := new(sync.Mutex)
	result := &ScanKeyResult{
		Cursors: make(map[string]uint64, len(querySet.Cursors)),
		Keys:    make([]*RedisKey, 0),
	}

	err := scanKeys(ctx, locker, nil, result, x.id, x.client, &ScanQuery{
		Count:   querySet.Query.Count,
		Keyword: querySet.Query.Keyword,
		Cursor:  querySet.Cursors[x.id],
	})
	if err != nil {
		return nil, err
	}

	return result, nil
}

func (x *StandaloneRedisDB) GetAllKeys(querySet *ScanQuerySet) (*ScanKeyResult, error) {
	var keys []*RedisKey

	scanResult, err := x.ScanKeys(querySet)
	if err != nil {
		return nil, err
	}

	keys = append(keys, scanResult.Keys...)

	for len(scanResult.Cursors) > 0 {
		querySet.Cursors = scanResult.Cursors
		if len(querySet.Cursors) > 0 {
			scanResult, err = x.ScanMoreKeys(querySet)
			if err != nil {
				return nil, err
			}

			keys = append(keys, scanResult.Keys...)
		} else {
			// empty map, stop loop
			for k := range scanResult.Cursors {
				delete(scanResult.Cursors, k)
			}
		}
	}

	return &ScanKeyResult{
		Cursors: make(map[string]uint64),
		Keys:    keys,
	}, nil
}

func (x *StandaloneRedisDB) GetKey(key string) (*RedisKey, error) {
	return newRedisKey(context.Background(), x.client, key)
}

func (x *StandaloneRedisDB) ScanElements(querySet *ScanQuerySet) (*ScanElementResult, error) {
	if querySet.Type == "" {
		return nil, serr.New("type is missing")
	}

	ctx := context.Background()
	switch querySet.Type {
	case common.RedisType_Hash:
		r, err := scanHashElements(ctx, x.client, querySet)
		return r, err
	case common.RedisType_List:
		r, err := scanListElements(ctx, x.client, querySet)
		return r, err
	case common.RedisType_Set:
		r, err := scanSetElements(ctx, x.client, querySet)
		return r, err
	case common.RedisType_ZSet:
		r, err := scanZSetElements(ctx, x.client, querySet)
		return r, err
	default:
		return nil, serr.Errorf("key type '%s' is not supported", querySet.Type)
	}
}

func (x *StandaloneRedisDB) GetAllElements(querySet *ScanQuerySet) (*ScanElementResult, error) {
	if querySet.Type == "" {
		return nil, serr.New("type is missing")
	}

	ctx := context.Background()
	switch querySet.Type {
	case common.RedisType_Hash:
		r, err := getAllHashElements(ctx, x.client, querySet)
		return r, err
	case common.RedisType_List:
		r, err := getAllListElements(ctx, x.client, querySet)
		return r, err
	case common.RedisType_Set:
		r, err := getAllSetElements(ctx, x.client, querySet)
		return r, err
	case common.RedisType_ZSet:
		r, err := getAllZSetElements(ctx, x.client, querySet)
		return r, err
	default:
		return nil, serr.Errorf("key type '%s' is not supported", querySet.Type)
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
