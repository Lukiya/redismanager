package rmr

import (
	"context"

	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/serr"
)

func saveHash(ctx context.Context, client redis.UniversalClient, clusterClient *redis.ClusterClient, cmd *SaveRedisEntryCommand) (err error) {
	if clusterClient != nil {
		var err error
		client, err = clusterClient.MasterForKey(ctx, cmd.New.Key)
		if err != nil {
			return serr.WithStack(err)
		}
	}

	if cmd.IsNew {
		err = client.HSet(ctx, cmd.New.Key, cmd.New.Field, cmd.New.Value).Err()
		if err != nil {
			return serr.WithStack(err)
		}
	} else {
		// # rename key
		err = renameKey(ctx, client, clusterClient, cmd.Old.Key, cmd.New.Key)
		if err != nil {
			return err
		}

		if cmd.New.Field != cmd.Old.Field {
			// # rename field
			err = renameHashField(ctx, client, cmd.New.Key, cmd.Old.Field, cmd.New.Field, cmd.New.Value)
			if err != nil {
				return err
			}
		}
	}

	// # update value
	err = client.HSet(ctx, cmd.New.Key, cmd.New.Field, cmd.New.Value).Err()
	if err != nil {
		return serr.WithStack(err)
	}

	return nil
}

func renameHashField(ctx context.Context, client redis.UniversalClient, key, oldField, newFiled string, value interface{}) (err error) {
	// set value to new field
	err = client.HSet(ctx, key, newFiled, value).Err()
	if err != nil {
		return serr.WithStack(err)
	}

	// delete old field
	err = client.HDel(ctx, key, oldField).Err()
	return serr.WithStack(err)
}

func scanHashElements(ctx context.Context, client redis.UniversalClient, querySet *ScanQuerySet) (*ScanElementResult, error) {
	elements, cur, err := client.HScan(ctx, querySet.Key, querySet.Query.Cursor, querySet.Query.Keyword, querySet.Query.Count).Result()
	if err != nil {
		return nil, serr.WithStack(err)
	}
	// if len(keys) < int(query.Count) && cur > 0 {
	// 	// if return keys is less than count limit, but has cursor
	// 	var leftKeys []string
	// 	// then keep read left keys
	// 	keys, cur, err = client.HScan(ctx, query.Key, query.Cursor, query.Match, query.Count).Result()
	// 	// and append it to results
	// 	keys = append(keys, leftKeys...)
	// }

	r := new(ScanElementResult)
	r.Elements = make([]*ElementResult, 0, len(elements)/2)
	r.Cursor = cur
	for i := range elements {
		if i%2 == 0 {
			r.Elements = append(r.Elements, &ElementResult{
				Key:   elements[i],
				Value: elements[i+1],
			})
		}
	}
	return r, nil
}

func getAllHashElements(ctx context.Context, client redis.UniversalClient, querySet *ScanQuerySet) (*ScanElementResult, error) {

	// scanResult, err := scanHashElements(ctx, client, querySet)
	// if err != nil {
	// 	return nil, err
	// }
	// r.Elements = append(r.Elements, scanResult.Elements...)

	// for scanResult.Cursor > 0 {
	// 	scanResult, err = scanHashElements(ctx, client, querySet)
	// 	if err != nil {
	// 		return nil, err
	// 	}
	// 	r.Elements = append(r.Elements, scanResult.Elements...)
	// }

	// return r, nil

	m, err := client.HGetAll(ctx, querySet.Key).Result()
	if err != nil {
		return nil, serr.WithStack(err)
	}
	r := new(ScanElementResult)
	r.Elements = make([]*ElementResult, 0, len(m))

	for k, v := range m {
		r.Elements = append(r.Elements, &ElementResult{Key: k, Value: v})
	}

	return r, nil
}

func delHash(ctx context.Context, client redis.UniversalClient, clusterClient *redis.ClusterClient, key, field string) error {
	if clusterClient != nil {
		var err error
		client, err = clusterClient.MasterForKey(ctx, key)
		if err != nil {
			return serr.WithStack(err)
		}
	}

	return client.HDel(ctx, key, field).Err()
}
