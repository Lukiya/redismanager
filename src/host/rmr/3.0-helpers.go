package rmr

import (
	"context"
	"fmt"
	"runtime"
	"sync"

	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/serr"
	"github.com/syncfuture/go/stask"
	"github.com/syncfuture/go/u"
)

func scanKeys(ctx context.Context, locker *sync.Mutex, wg *sync.WaitGroup, scanKeyResult *ScanKeyResult, id string, client *redis.Client, query *ScanQuery) error {
	if wg != nil {
		defer func() { wg.Done() }()
	}

	keys, cur, err := client.Scan(ctx, query.Cursor, query.Keyword, query.Count).Result()
	if err != nil {
		return serr.WithStack(err)
	}

	for cur > 0 && len(keys) == 0 {
		keys, cur, err = client.Scan(ctx, cur, query.Keyword, query.Count).Result()
		if err != nil {
			return serr.WithStack(err)
		}
	}

	redisKeys := stringKeysToRedisKeys(client, keys)

	locker.Lock()
	defer func() { locker.Unlock() }()
	scanKeyResult.Keys = append(scanKeyResult.Keys, redisKeys...)

	if cur > 0 {
		scanKeyResult.Cursors[id] = cur
	}

	return nil
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
	id := fmt.Sprintf("%s:%d", client.Options().Addr, client.Options().DB)
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

		// dump old key data
		dumpData, err := oldKeyClient.Dump(ctx, oldKey).Result()
		if err != nil {
			return serr.WithStack(err)
		}

		// restore old key data to new key
		err = newKeyClient.Restore(ctx, newKey, -1, dumpData).Err()
		if err != nil {
			return serr.WithStack(err)
		}

		// delete old key
		err = oldKeyClient.Del(ctx, oldKey).Err()
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

// func getRedisEntry(key, elementKey string, client redis.UniversalClient) (*RedisEntry, error) {
// 	r := &RedisEntry{
// 		Key: key,
// 	}
// 	ctx := context.Background()
// 	var err error

// 	r.Type, err = client.Type(ctx, key).Result()

// 	switch r.Type {
// 	case common.RedisType_Hash:
// 		r.Field = elementKey
// 		r.Value, err = client.HGet(ctx, key, elementKey).Result()
// 		break
// 	case common.RedisType_List:
// 		r.Index = sconv.ToInt64(elementKey)
// 		r.Value, err = client.LIndex(ctx, key, r.Index).Result()
// 		break
// 	case common.RedisType_Set:
// 		r.Value = elementKey
// 		break
// 	case common.RedisType_ZSet:
// 		r.Score, err = client.ZScore(ctx, key, elementKey).Result()
// 		r.Value = elementKey
// 		break
// 	}

// 	return r, err
// }
