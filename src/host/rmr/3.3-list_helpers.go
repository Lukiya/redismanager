package rmr

import (
	"context"
	"strconv"

	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/serr"
)

func saveList(ctx context.Context, client redis.UniversalClient, clusterClient *redis.ClusterClient, cmd *SaveRedisEntryCommand) (err error) {
	if clusterClient != nil {
		var err error
		client, err = clusterClient.MasterForKey(ctx, cmd.New.Key)
		if err != nil {
			return serr.WithStack(err)
		}
	}

	if cmd.IsNew {
		err = client.RPush(ctx, cmd.New.Key, cmd.New.Value).Err()
		if err != nil {
			return serr.WithStack(err)
		}
	} else {
		// rename key
		err = renameKey(ctx, client, clusterClient, cmd.Old.Key, cmd.New.Key)
		if err != nil {
			return err
		}
	}

	if cmd.New.Field != "" {
		// # update value
		index, err := strconv.ParseInt(cmd.New.Field, 10, 64)
		if err != nil {
			return serr.WithStack(err)
		}
		err = client.LSet(ctx, cmd.New.Key, index, cmd.New.Value).Err()
		if err != nil {
			return serr.WithStack(err)
		}
	}

	return
}

func getListElements(ctx context.Context, client redis.UniversalClient, query *ScanQuerySet) (*ScanElementResult, error) {
	keys, err := client.LRange(ctx, query.Key, int64(query.Query.Cursor), int64(query.Query.Cursor)+query.Query.Count).Result()
	if err != nil {
		return nil, serr.WithStack(err)
	}

	r := new(ScanElementResult)
	r.Elements = make([]*ElementResult, 0, query.Query.Count)

	if len(keys) == 0 {
		query.Query.Cursor = 0
	} else {
		for i := range keys {
			r.Elements = append(r.Elements, &ElementResult{
				Index: query.Query.Cursor + uint64(i),
				Value: keys[i],
			})
		}
		r.Cursor = query.Query.Cursor + uint64(query.Query.Count) + 1
	}

	return r, nil
}

func delList(ctx context.Context, client redis.UniversalClient, clusterClient *redis.ClusterClient, key, element string) error {
	if clusterClient != nil {
		var err error
		client, err = clusterClient.MasterForKey(ctx, key)
		if err != nil {
			return serr.WithStack(err)
		}
	}

	return client.LRem(ctx, key, 0, element).Err()
}
