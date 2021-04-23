package rmr

import (
	"context"
	"strconv"

	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/sconv"
	"github.com/syncfuture/go/serr"
)

func saveZSet(ctx context.Context, client redis.UniversalClient, clusterClient *redis.ClusterClient, cmd *SaveRedisEntryCommand) error {
	if clusterClient != nil {
		var err error
		client, err = clusterClient.MasterForKey(ctx, cmd.New.Key)
		if err != nil {
			return serr.WithStack(err)
		}
	}

	var err error
	var score float64
	if cmd.New.Field != "" {
		score, err = strconv.ParseFloat(cmd.New.Field, 64)
		if err != nil {
			return err
		}
	}

	if cmd.IsNew {
		err = client.ZAdd(ctx, cmd.New.Key, &redis.Z{
			Score:  score,
			Member: cmd.New.Value,
		}).Err()
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

	if cmd.New.Field != "" {
		err = client.ZRem(ctx, cmd.New.Key, cmd.Old.Value).Err()
		if err != nil {
			return serr.WithStack(err)
		}
		err = client.ZAdd(ctx, cmd.New.Key, &redis.Z{
			Score:  score,
			Member: cmd.New.Value,
		}).Err()
		if err != nil {
			return serr.WithStack(err)
		}
	}

	return nil
}

func scanZSetElements(ctx context.Context, client redis.UniversalClient, query *ScanQuerySet) (*ScanElementResult, error) {
	elements, cur, err := client.ZScan(ctx, query.Key, query.Query.Cursor, query.Query.Keyword, query.Query.Count).Result()
	if err != nil {
		return nil, serr.WithStack(err)
	}
	// if len(keys) < int(query.Count) && cur > 0 {
	// 	// if return keys is less than count limit, but has cursor
	// 	var leftKeys []string
	// 	// then keep read left keys
	// 	keys, cur, err = client.ZScan(ctx, query.Key, query.Cursor, query.Match, query.Count).Result()
	// 	// and append it to results
	// 	keys = append(keys, leftKeys...)
	// }

	r := new(ScanElementResult)
	r.Elements = make([]*ElementResult, 0, len(elements)/2)
	r.Cursor = cur
	for i := range elements {
		if i%2 == 0 {
			r.Elements = append(r.Elements, &ElementResult{
				Key:   elements[i],                    // element
				Value: sconv.ToFloat64(elements[i+1]), // score
			})
		}
	}
	return r, nil
}
func getAllZSetElements(ctx context.Context, client redis.UniversalClient, query *ScanQuerySet) (*ScanElementResult, error) {
	elements, err := client.ZRangeByScoreWithScores(ctx, query.Key, &redis.ZRangeBy{
		Min: "-inf",
		Max: "+inf",
		// Offset: 0,
		// Count:  2,
	}).Result()

	if err != nil {
		return nil, serr.WithStack(err)
	}

	r := new(ScanElementResult)
	r.Elements = make([]*ElementResult, 0, len(elements))

	for _, v := range elements {
		r.Elements = append(r.Elements, &ElementResult{
			Key:   v.Member, // element
			Value: v.Score,  // score
		})
	}

	return r, nil
}

func delZSet(ctx context.Context, client redis.UniversalClient, clusterClient *redis.ClusterClient, key, element string) error {
	if clusterClient != nil {
		var err error
		client, err = clusterClient.MasterForKey(ctx, key)
		if err != nil {
			return serr.WithStack(err)
		}
	}

	return client.ZRem(ctx, key, element).Err()
}
