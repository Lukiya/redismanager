package rmr

import (
	"context"

	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/serr"
)

func saveSet(ctx context.Context, client redis.UniversalClient, clusterClient *redis.ClusterClient, cmd *SaveRedisEntryCommand) (err error) {
	if clusterClient != nil {
		var err error
		client, err = clusterClient.MasterForKey(ctx, cmd.New.Key)
		if err != nil {
			return serr.WithStack(err)
		}
	}

	if cmd.IsNew {
		err = client.SAdd(ctx, cmd.New.Key, cmd.New.Value).Err()
		if err != nil {
			return serr.WithStack(err)
		}
	} else if cmd.New.Key != cmd.Old.Key {
		// rename key
		err = renameKey(ctx, client, clusterClient, cmd.Old.Key, cmd.New.Key)
		if err != nil {
			return err
		}
	}

	err = client.SRem(ctx, cmd.Old.Key, cmd.Old.Value).Err()
	if err != nil {
		return serr.WithStack(err)
	}
	err = client.SAdd(ctx, cmd.New.Key, cmd.New.Value).Err()
	if err != nil {
		return serr.WithStack(err)
	}

	return err
}

func scanSetElements(ctx context.Context, client redis.UniversalClient, query *ScanQuerySet) (*ScanElementResult, error) {
	elements, cur, err := client.SScan(ctx, query.Key, query.Query.Cursor, query.Query.Keyword, query.Query.Count).Result()
	if err != nil {
		return nil, serr.WithStack(err)
	}
	// if len(keys) < int(query.Count) && cur > 0 {
	// 	// if return keys is less than count limit, but has cursor
	// 	var leftKeys []string
	// 	// then keep read left keys
	// 	keys, cur, err = client.SScan(ctx, query.Key, query.Cursor, query.Match, query.Count).Result()
	// 	// and append it to results
	// 	keys = append(keys, leftKeys...)
	// }

	r := new(ScanElementResult)
	r.Elements = make([]*ElementResult, 0, len(elements))
	r.Cursor = cur
	for _, value := range elements {
		r.Elements = append(r.Elements, &ElementResult{
			// Field: value,
			Key: value,
			// Value: value,
		})
	}
	return r, nil
}

func getAllSetElements(ctx context.Context, client redis.UniversalClient, querySet *ScanQuerySet) (*ScanElementResult, error) {
	elements, err := client.SMembers(ctx, querySet.Key).Result()
	if err != nil {
		return nil, serr.WithStack(err)
	}

	r := new(ScanElementResult)
	r.Elements = make([]*ElementResult, 0, len(elements))

	for _, v := range elements {
		r.Elements = append(r.Elements, &ElementResult{
			Key: v,
		})
	}

	return r, nil
}

func delSet(ctx context.Context, client redis.UniversalClient, clusterClient *redis.ClusterClient, key, element string) error {
	if clusterClient != nil {
		var err error
		client, err = clusterClient.MasterForKey(ctx, key)
		if err != nil {
			return serr.WithStack(err)
		}
	}

	return client.SRem(ctx, key, element).Err()
}
