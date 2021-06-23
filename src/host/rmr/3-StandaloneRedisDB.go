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
	case shared.RedisType_Hash:
		r, err := scanHashElements(ctx, x.client, querySet)
		return r, err
	case shared.RedisType_List:
		r, err := scanListElements(ctx, x.client, querySet)
		return r, err
	case shared.RedisType_Set:
		r, err := scanSetElements(ctx, x.client, querySet)
		return r, err
	case shared.RedisType_ZSet:
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
	case shared.RedisType_Hash:
		r, err := getAllHashElements(ctx, x.client, querySet)
		return r, err
	case shared.RedisType_List:
		r, err := getAllListElements(ctx, x.client, querySet)
		return r, err
	case shared.RedisType_Set:
		r, err := getAllSetElements(ctx, x.client, querySet)
		return r, err
	case shared.RedisType_ZSet:
		r, err := getAllZSetElements(ctx, x.client, querySet)
		return r, err
	default:
		return nil, serr.Errorf("key type '%s' is not supported", querySet.Type)
	}
}

func (x *StandaloneRedisDB) KeyExists(key string) (bool, error) {
	return keyExists(context.Background(), x.client, key)
}

func (x *StandaloneRedisDB) SaveEntry(cmd *SaveRedisEntryCommand) error {
	if cmd.New.Key == "" {
		return serr.WithStack(shared.KeyEmptyError)
	}

	ctx := context.Background()

	var err error
	switch cmd.New.Type {
	case shared.RedisType_String:
		err = saveString(ctx, x.client, nil, cmd)
		break
	case shared.RedisType_Hash:
		err = saveHash(ctx, x.client, nil, cmd)
		break
	case shared.RedisType_List:
		err = saveList(ctx, x.client, nil, cmd)
		break
	case shared.RedisType_Set:
		err = saveSet(ctx, x.client, nil, cmd)
		break
	case shared.RedisType_ZSet:
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

func (x *StandaloneRedisDB) DeleteEntries(cmd *DeleteRedisEntriesCommand) error {
	ctx := context.Background()

	scheduler := stask.NewFlowScheduler(runtime.NumCPU())

	scheduler.SliceRun(&cmd.Commands, func(_ int, v interface{}) {
		cmd := v.(*DeleteRedisEntryCommand)
		err := x.deleteEntry(ctx, cmd)
		u.LogError(err)
	})

	return nil
}

func (x *StandaloneRedisDB) deleteEntry(ctx context.Context, cmd *DeleteRedisEntryCommand) error {
	if cmd.ElementKey == "" {
		return x.client.Del(ctx, cmd.Key).Err()
	} else {
		redisKey, err := x.GetKey(cmd.Key)
		if err != nil {
			return err
		}

		switch redisKey.Type {
		case shared.RedisType_Hash:
			err = delHash(ctx, x.client, nil, cmd.Key, cmd.ElementKey)
			break
		case shared.RedisType_List:
			err = delList(ctx, x.client, nil, cmd.Key, cmd.ElementKey)
			break
		case shared.RedisType_Set:
			err = delSet(ctx, x.client, nil, cmd.Key, cmd.ElementKey)
			break
		case shared.RedisType_ZSet:
			err = delZSet(ctx, x.client, nil, cmd.Key, cmd.ElementKey)
			break
		default:
			err = serr.Errorf("key type '%s' is not supported", redisKey.Type)
			break
		}
		return err
	}
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
	case shared.RedisType_Hash:
		err = delHash(ctx, x.client, nil, key, element)
		break
	case shared.RedisType_List:
		err = delList(ctx, x.client, nil, key, element)
		break
	case shared.RedisType_Set:
		err = delSet(ctx, x.client, nil, key, element)
		break
	case shared.RedisType_ZSet:
		err = delZSet(ctx, x.client, nil, key, element)
		break
	default:
		err = serr.Errorf("key type '%s' is not supported", redisKey.Type)
		break
	}

	return err
}

func (x *StandaloneRedisDB) GetRedisEntry(key, elementKey string) (*RedisEntry, error) {
	return NewRedisEntry(key, elementKey, x.client)
}

func (x *StandaloneRedisDB) ExportKeys(keys ...string) ([]byte, error) {
	ctx := context.Background()
	exporter := io.NewExporter(ctx, true, x.client, nil)
	return exporter.ExportKeys(keys...)
}

func (x *StandaloneRedisDB) ImportKeys(data []byte) (int, error) {
	ctx := context.Background()
	importer := io.NewImporter(ctx, x.client, nil)
	return importer.ImportKeys(data)
}
