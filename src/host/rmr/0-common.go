package rmr

import (
	"context"
	"fmt"
	"runtime"
	"sync"
	"time"

	"github.com/Lukiya/redismanager/src/go/io"
	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/serr"
	"github.com/syncfuture/go/stask"
	"github.com/syncfuture/go/u"
)

const (
	_clusterDisabedError = "ERR This instance has cluster support disabled"
)

type IRedisDB interface {
	ScanKeys(query *ScanQuery) (map[string]*KeyQueryResult, error)
	ScanMoreKeys(queries map[string]*ScanQuery) (map[string]*KeyQueryResult, error)
	GetAllKeys(query *ScanQuery) ([]*RedisKey, error)
	GetKey(key string) (*RedisKey, error)
	GetMembers(query *ScanQuerySet) (*MemberQueryResult, error)
	KeyExists(key string) (bool, error)
	SaveValue(cmd *SaveRedisEntryCommand) error
}

type ServerConfig struct {
	ID       string   `json:"ID,omitempty"`
	Name     string   `json:"Name,omitempty"`
	Addrs    []string `json:"Addrs,omitempty"`
	Password string   `json:"Password,omitempty"`
	Selected bool     `json:"Selected,omitempty"`
}

type ScanQuerySet struct {
	Key     string
	Type    string
	Query   *ScanQuery
	Queries map[string]*ScanQuery
}

type ScanQuery struct {
	Cursor  uint64
	Count   int64
	Keyword string
}

type KeyQueryResult struct {
	Cursor uint64
	Keys   []*RedisKey
}

type MemberResult struct {
	Field string
	Value string
	Index uint64
	Score float64
}

type MemberQueryResult struct {
	Cursor  uint64
	Members []*MemberResult
}

type SaveRedisEntryCommand struct {
	New   *RedisEntry `json:"new"`
	Old   *RedisEntry `json:"old"`
	IsNew bool        `json:"isNew"`
}
type RedisEntry struct {
	Key   string
	Type  string
	Field string
	Value string
	TTL   int64
}

func saveTTL(ctx context.Context, client redis.UniversalClient, clusterClient *redis.ClusterClient, cmd *SaveRedisEntryCommand) (err error) {
	if clusterClient != nil {
		var err error
		client, err = clusterClient.MasterForKey(ctx, cmd.New.Key)
		if err != nil {
			return serr.WithStack(err)
		}
	}

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

func scanKeys(ctx context.Context, locker *sync.Mutex, wg *sync.WaitGroup, results *map[string]*KeyQueryResult, id string, client *redis.Client, query *ScanQuery) {
	if wg != nil {
		defer func() { wg.Done() }()
	}

	keys, cur, err := client.Scan(ctx, query.Cursor, query.Keyword, query.Count).Result()
	if u.LogError(err) { // todo
		return
	}

	for cur > 0 && len(keys) == 0 {
		keys, cur, err = client.Scan(ctx, cur, query.Keyword, query.Count).Result()
		if u.LogError(err) { // todo
			return
		}
	}

	redisKeys := stringKeysToRedisKeys(client, keys)

	locker.Lock()
	defer func() { locker.Unlock() }()
	(*results)[id] = &KeyQueryResult{
		Cursor: cur,
		Keys:   redisKeys,
	}
}

func stringKeysToRedisKeys(client *redis.Client, keys []string) []*RedisKey {
	r := make([]*RedisKey, len(keys))

	f := stask.NewFlowScheduler(runtime.NumCPU())

	locker := new(sync.Mutex)
	f.SliceRun(&keys, func(i int, v interface{}) {
		redisKey, err := newRedisKey(context.Background(), client, v.(string))
		if u.LogError(err) {
			return
		}
		locker.Lock()
		defer func() { locker.Unlock() }()
		r[i] = redisKey
	})

	return r
}

func generateClientID(client *redis.Client) string {
	id := fmt.Sprintf("%s->%d", client.Options().Addr, client.Options().DB)
	return id
}

func renameKey(ctx context.Context, client redis.UniversalClient, clusterClient *redis.ClusterClient, oldKey, newKey string) error {
	if oldKey == newKey {
		return nil
	}

	if clusterClient != nil {
		newKeyClient, err := clusterClient.MasterForKey(ctx, newKey)
		if err != nil {
			return serr.WithStack(err)
		}

		oldKeyClient, err := clusterClient.MasterForKey(ctx, oldKey)
		if err != nil {
			return serr.WithStack(err)
		}

		exporter := io.NewExporter(ctx, false, oldKeyClient)
		keyData, err := exporter.ExportKeys(oldKey)
		if err != nil {
			return err
		}

		err = oldKeyClient.Del(ctx, oldKey).Err()
		if err != nil {
			return err
		}

		importer := io.NewImporter(ctx, newKeyClient)
		_, err = importer.ImportKeys(keyData)
		if err != nil {
			return err
		}
	} else {
		err := client.Rename(ctx, oldKey, newKey).Err()
		if err != nil {
			return serr.WithStack(err)
		}
	}

	return nil
}
