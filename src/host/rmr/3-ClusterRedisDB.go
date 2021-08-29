package rmr

import (
	"context"
	"runtime"
	"sync"

	"github.com/Lukiya/redismanager/src/go/io"
	"github.com/Lukiya/redismanager/src/go/shared"
	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/serr"
	"github.com/syncfuture/go/stask"
	"github.com/syncfuture/go/u"
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

func (x *ClusterRedisDB) GetDB() int {
	return x.DB
}

func (x *ClusterRedisDB) ScanKeys(querySet *ScanQuerySet) (*ScanKeyResult, error) {
	ctx := context.Background()

	locker := new(sync.Mutex)
	queries := make(map[string]*ScanQuery, len(x.masterClients))
	result := &ScanKeyResult{
		Cursors: make(map[string]uint64, len(x.masterClients)),
		Keys:    make([]*RedisKey, 0),
	}
	wg := new(sync.WaitGroup)
	errCh := make(chan error, 1)

	for i, c := range x.masterClients {
		wg.Add(1)
		queries[i] = &ScanQuery{
			Keyword: querySet.Query.Keyword,
			Count:   querySet.Query.Count,
		}

		go func(id string, client *redis.Client, query *ScanQuery) {
			err := scanKeys(ctx, locker, wg, result, id, client, query)
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
		return result, nil
	}
}

func (x *ClusterRedisDB) ScanMoreKeys(querySet *ScanQuerySet) (*ScanKeyResult, error) {
	ctx := context.Background()

	locker := new(sync.Mutex)
	result := &ScanKeyResult{
		Cursors: make(map[string]uint64, len(querySet.Cursors)),
		Keys:    make([]*RedisKey, 0),
	}
	wg := new(sync.WaitGroup)
	errCh := make(chan error, 1)

	for i, c := range x.masterClients {
		if cur, ok := querySet.Cursors[i]; ok {
			wg.Add(1)
			go func(id string, client *redis.Client, query *ScanQuery) {
				err := scanKeys(ctx, locker, wg, result, id, client, query)
				if err != nil {
					select {
					case errCh <- err:
					default:
					}
				}
			}(i, c, &ScanQuery{
				Count:   querySet.Query.Count,
				Keyword: querySet.Query.Keyword,
				Cursor:  cur,
			})
		}
	}

	wg.Wait()
	select {
	case err := <-errCh:
		return nil, err
	default:
		return result, nil
	}
}

func (x *ClusterRedisDB) GetAllKeys(querySet *ScanQuerySet) (*ScanKeyResult, error) {
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

func (x *ClusterRedisDB) GetKey(key string) (*RedisKey, error) {
	ctx := context.Background()
	client, err := x.clusterClient.MasterForKey(ctx, key)
	if err != nil {
		return nil, serr.WithStack(err)
	}

	return newRedisKey(ctx, client, key)
}

func (x *ClusterRedisDB) ScanElements(querySet *ScanQuerySet) (*ScanElementResult, error) {
	if querySet.Type == "" {
		return nil, serr.New("type is missing")
	}

	ctx := context.Background()
	client, err := x.clusterClient.MasterForKey(ctx, querySet.Key)
	if err != nil {
		return nil, serr.WithStack(err)
	}

	switch querySet.Type {
	case shared.RedisType_Hash:
		r, err := scanHashElements(ctx, client, querySet)
		return r, err
	case shared.RedisType_List:
		r, err := scanListElements(ctx, client, querySet)
		return r, err
	case shared.RedisType_Set:
		r, err := scanSetElements(ctx, client, querySet)
		return r, err
	case shared.RedisType_ZSet:
		r, err := scanZSetElements(ctx, client, querySet)
		return r, err
	default:
		return nil, serr.Errorf("key type '%s' is not supported", querySet.Type)
	}
}
func (x *ClusterRedisDB) GetAllElements(querySet *ScanQuerySet) (*ScanElementResult, error) {
	if querySet.Type == "" {
		return nil, serr.New("type is missing")
	}

	ctx := context.Background()
	client, err := x.clusterClient.MasterForKey(ctx, querySet.Key)
	if err != nil {
		return nil, serr.WithStack(err)
	}

	switch querySet.Type {
	case shared.RedisType_Hash:
		r, err := getAllHashElements(ctx, client, querySet)
		return r, err
	case shared.RedisType_List:
		r, err := getAllListElements(ctx, client, querySet)
		return r, err
	case shared.RedisType_Set:
		r, err := getAllSetElements(ctx, client, querySet)
		return r, err
	case shared.RedisType_ZSet:
		r, err := getAllZSetElements(ctx, client, querySet)
		return r, err
	default:
		return nil, serr.Errorf("key type '%s' is not supported", querySet.Type)
	}
}

func (x *ClusterRedisDB) KeyExists(key string) (bool, error) {
	return keyExists(context.Background(), x.clusterClient, key)
}

func (x *ClusterRedisDB) SaveEntry(cmd *SaveRedisEntryCommand) error {
	if cmd.New.Key == "" {
		return serr.WithStack(shared.KeyEmptyError)
	}

	ctx := context.Background()

	if cmd.IsNew {
		// Check if new key is existing
		exists, err := x.KeyExists(cmd.New.Key)
		if err != nil {
			return err
		}

		if exists {
			return shared.KeyExistsError
		}
	}

	var err error

	switch cmd.New.Type {
	case shared.RedisType_String:
		err = saveString(ctx, x.clusterClient, x.clusterClient, cmd)
		break
	case shared.RedisType_Hash:
		err = saveHash(ctx, x.clusterClient, x.clusterClient, cmd)
		break
	case shared.RedisType_List:
		err = saveList(ctx, x.clusterClient, x.clusterClient, cmd)
		break
	case shared.RedisType_Set:
		err = saveSet(ctx, x.clusterClient, x.clusterClient, cmd)
		break
	case shared.RedisType_ZSet:
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

func (x *ClusterRedisDB) DeleteEntries(cmd *DeleteRedisEntriesCommand) error {
	ctx := context.Background()

	scheduler := stask.NewFlowScheduler(runtime.NumCPU())

	scheduler.SliceRun(&cmd.Commands, func(_ int, v interface{}) {
		cmd := v.(*DeleteRedisEntryCommand)
		err := x.deleteEntry(ctx, cmd)
		u.LogError(err)
	})

	return nil
}

func (x *ClusterRedisDB) deleteEntry(ctx context.Context, cmd *DeleteRedisEntryCommand) error {
	client, err := x.clusterClient.MasterForKey(ctx, cmd.Key)
	if err != nil {
		return serr.WithStack(err)
	}

	if cmd.ElementKey == "" {
		return client.Del(ctx, cmd.Key).Err()
	} else {
		redisKey, err := x.GetKey(cmd.Key)
		if err != nil {
			return err
		}

		switch redisKey.Type {
		case shared.RedisType_Hash:
			err = delHash(ctx, x.clusterClient, x.clusterClient, cmd.Key, cmd.ElementKey)
			break
		case shared.RedisType_List:
			err = delList(ctx, x.clusterClient, x.clusterClient, cmd.Key, cmd.ElementKey)
			break
		case shared.RedisType_Set:
			err = delSet(ctx, x.clusterClient, x.clusterClient, cmd.Key, cmd.ElementKey)
			break
		case shared.RedisType_ZSet:
			err = delZSet(ctx, x.clusterClient, x.clusterClient, cmd.Key, cmd.ElementKey)
			break
		default:
			err = serr.Errorf("key type '%s' is not supported", redisKey.Type)
			break
		}
		return err
	}
}

func (x *ClusterRedisDB) GetRedisEntry(key, elementKey string) (*RedisEntry, error) {
	return NewRedisEntry(key, elementKey, x.clusterClient)
}

func (x *ClusterRedisDB) ExportKeys(keys ...string) ([]byte, error) {
	ctx := context.Background()
	exporter := io.NewExporter(ctx, true, x.clusterClient, x.clusterClient)

	if len(keys) == 0 {
		// export all keys if no keys are specified
		keyQueryResult, err := x.GetAllKeys(&ScanQuerySet{Query: &ScanQuery{Count: 100}})
		if err != nil {
			return nil, err
		}

		for _, a := range keyQueryResult.Keys {
			keys = append(keys, a.Key)
		}
	}

	return exporter.ExportKeys(keys...)
}

func (x *ClusterRedisDB) ImportKeys(data []byte) (int, error) {
	ctx := context.Background()
	importer := io.NewImporter(ctx, x.clusterClient, x.clusterClient)
	return importer.ImportKeys(data)
}
