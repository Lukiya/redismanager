package rmr

import (
	"context"

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

	err = client.LSet(ctx, cmd.New.Key, cmd.New.Index, cmd.New.Value).Err()
	if err != nil {
		return serr.WithStack(err)
	}

	return nil
}

func scanListElements(ctx context.Context, client redis.UniversalClient, query *ScanQuerySet) (*ScanElementResult, error) {
	elements, err := client.LRange(ctx, query.Key, int64(query.Query.Cursor), int64(query.Query.Cursor)+query.Query.Count).Result()
	if err != nil {
		return nil, serr.WithStack(err)
	}

	r := new(ScanElementResult)
	r.Elements = make([]*ElementResult, 0, len(elements))

	if len(elements) == 0 {
		// query.Query.Cursor = 0
		r.Cursor = 0
	} else {
		for i := range elements {
			r.Elements = append(r.Elements, &ElementResult{
				Key:   query.Query.Cursor + uint64(i),
				Value: elements[i],
			})
		}
		if len(elements) < int(query.Query.Count) {
			r.Cursor = 0
		} else {
			r.Cursor = query.Query.Cursor + uint64(query.Query.Count) + 1
		}
	}

	return r, nil
}

func getAllListElements(ctx context.Context, client redis.UniversalClient, querySet *ScanQuerySet) (*ScanElementResult, error) {
	elements, err := client.LRange(ctx, querySet.Key, 0, -1).Result()
	if err != nil {
		return nil, serr.WithStack(err)
	}

	r := new(ScanElementResult)
	r.Elements = make([]*ElementResult, 0, len(elements))

	for i := range elements {
		r.Elements = append(r.Elements, &ElementResult{
			Key:   i,
			Value: elements[i],
		})
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
