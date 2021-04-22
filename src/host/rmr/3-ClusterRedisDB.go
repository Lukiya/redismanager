package rmr

import (
	"context"
	"sync"

	"github.com/Lukiya/redismanager/src/go/common"
	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/serr"
)

func NewClusterRedisDB(clusterClient *redis.ClusterClient, masterClients map[string]*redis.Client) IRedisDB {
	return &ClusterRedisDB{
		DB:            0,
		clusterClient: clusterClient,
		masterClients: masterClients,
	}
}

type ClusterRedisDB struct {
	DB            int
	clusterClient *redis.ClusterClient
	masterClients map[string]*redis.Client
}

func (x *ClusterRedisDB) ScanKeys(query *ScanQuery) (map[string]*KeyQueryResult, error) {
	ctx := context.Background()

	locker := new(sync.Mutex)
	queries := make(map[string]*ScanQuery, len(x.masterClients))
	results := make(map[string]*KeyQueryResult, len(x.masterClients))
	wg := new(sync.WaitGroup)
	errCh := make(chan error, 1)

	for i, c := range x.masterClients {
		wg.Add(1)
		queries[i] = &ScanQuery{
			Keyword: query.Keyword,
			Count:   query.Count,
		}

		go func(id string, client *redis.Client, query *ScanQuery) {
			err := scanKeys(ctx, locker, wg, &results, id, client, query)
			if err != nil {
				select {
				case errCh <- err:
				default:
				}
			}
		}(i, c, queries[i])
	}

	wg.Wait()

	select {
	case err := <-errCh:
		return nil, err
	default:
		return results, nil
	}
}

func (x *ClusterRedisDB) ScanMoreKeys(queries map[string]*ScanQuery) (map[string]*KeyQueryResult, error) {
	ctx := context.Background()

	locker := new(sync.Mutex)
	results := make(map[string]*KeyQueryResult, len(queries))
	wg := new(sync.WaitGroup)
	errCh := make(chan error, 1)

	for i, c := range x.masterClients {
		if q, ok := queries[i]; ok {
			wg.Add(1)
			go func(id string, client *redis.Client, query *ScanQuery) {
				err := scanKeys(ctx, locker, wg, &results, id, client, query)
				if err != nil {
					select {
					case errCh <- err:
					default:
					}
				}
			}(i, c, q)
		}
	}

	wg.Wait()
	select {
	case err := <-errCh:
		return nil, err
	default:
		return results, nil
	}
}

func (x *ClusterRedisDB) GetAllKeys(query *ScanQuery) ([]*RedisKey, error) {
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

func (x *ClusterRedisDB) GetKey(key string) (*RedisKey, error) {
	ctx := context.Background()
	client, err := x.clusterClient.MasterForKey(ctx, key)
	if err != nil {
		return nil, serr.WithStack(err)
	}

	return newRedisKey(ctx, client, key)
}

func (x *ClusterRedisDB) GetElements(query *ScanQuerySet) (*ElementQueryResult, error) {
	if query.Type == "" {
		return nil, serr.New("type is missing")
	}

	ctx := context.Background()
	client, err := x.clusterClient.MasterForKey(ctx, query.Key)
	if err != nil {
		return nil, serr.WithStack(err)
	}

	switch query.Type {
	case common.RedisType_Hash:
		r, err := getHashElements(ctx, client, query)
		return r, err
	case common.RedisType_List:
		r, err := getListElements(ctx, client, query)
		return r, err
	case common.RedisType_Set:
		r, err := getSetElements(ctx, client, query)
		return r, err
	case common.RedisType_ZSet:
		r, err := getZSetElements(ctx, client, query)
		return r, err
	default:
		return nil, serr.Errorf("key type '%s' is not supported", query.Type)
	}
}

func (x *ClusterRedisDB) KeyExists(key string) (bool, error) {
	ctx := context.Background()

	client, err := x.clusterClient.MasterForKey(ctx, key)
	if err != nil {
		return false, serr.WithStack(err)
	}

	count, err := client.Exists(ctx, key).Result()
	if err != nil {
		return false, serr.WithStack(err)
	}

	return count > 0, nil
}

func (x *ClusterRedisDB) SaveValue(cmd *SaveRedisEntryCommand) error {
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

	var err error

	switch cmd.New.Type {
	case common.RedisType_String:
		err = saveString(ctx, x.clusterClient, x.clusterClient, cmd)
		break
	case common.RedisType_Hash:
		err = saveHash(ctx, x.clusterClient, x.clusterClient, cmd)
		break
	case common.RedisType_List:
		err = saveList(ctx, x.clusterClient, x.clusterClient, cmd)
		break
	case common.RedisType_Set:
		err = saveSet(ctx, x.clusterClient, x.clusterClient, cmd)
		break
	case common.RedisType_ZSet:
		err = saveZSet(ctx, x.clusterClient, x.clusterClient, cmd)
		break
	default:
		err = serr.Errorf("key type '%s' is not supported", cmd.New.Type)
		break
	}

	if err != nil {
		return err
	}

	////////// save TTL
	return saveTTL(ctx, x.clusterClient, x.clusterClient, cmd)
}

func (x *ClusterRedisDB) DeleteKey(key string) error {
	ctx := context.Background()
	client, err := x.clusterClient.MasterForKey(ctx, key)
	if err != nil {
		return serr.WithStack(err)
	}

	return client.Del(ctx, key).Err()
}

func (x *ClusterRedisDB) DeleteElement(key, typ, element string) error {
	ctx := context.Background()

	var err error
	switch typ {
	case common.RedisType_Hash:
		err = delHash(ctx, x.clusterClient, x.clusterClient, key, element)
		break
	case common.RedisType_List:
		err = delList(ctx, x.clusterClient, x.clusterClient, key, element)
		break
	case common.RedisType_Set:
		err = delSet(ctx, x.clusterClient, x.clusterClient, key, element)
		break
	case common.RedisType_ZSet:
		err = delZSet(ctx, x.clusterClient, x.clusterClient, key, element)
		break
	default:
		err = serr.Errorf("key type '%s' is not supported", typ)
		break
	}

	return err
}
