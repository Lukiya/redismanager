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

func getZSetMembers(ctx context.Context, client redis.UniversalClient, query *ScanQuerySet) (*MemberQueryResult, error) {
	keys, cur, err := client.ZScan(ctx, query.Key, query.Query.Cursor, query.Query.Keyword, query.Query.Count).Result()
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

	r := new(MemberQueryResult)
	r.Members = make([]*MemberResult, 0, query.Query.Count)
	r.Cursor = cur
	for i := range keys {
		if i%2 == 0 {
			r.Members = append(r.Members, &MemberResult{
				Value: keys[i],
				Score: sconv.ToFloat64(keys[i+1]), // score
			})
		}
	}
	return r, nil
}
