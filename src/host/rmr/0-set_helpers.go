package rmr

import (
	"context"

	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/serr"
)

func saveSet(ctx context.Context, client redis.UniversalClient, cmd *SaveRedisEntryCommand) (err error) {
	if cmd.IsNew {
		err = client.SAdd(ctx, cmd.New.Key, cmd.New.Value).Err()
		if err != nil {
			return serr.WithStack(err)
		}
	} else if cmd.New.Key != cmd.Old.Key {
		// rename key
		err = client.Rename(ctx, cmd.Old.Key, cmd.New.Key).Err()
		if err != nil {
			return serr.WithStack(err)
		}
	}

	if cmd.New.Field != "" {
		err = client.SRem(ctx, cmd.New.Key, cmd.Old.Value).Err()
		if err != nil {
			return serr.WithStack(err)
		}
		err = client.SAdd(ctx, cmd.New.Key, cmd.New.Value).Err()
		if err != nil {
			return serr.WithStack(err)
		}
	}
	return err
}

func getSetMembers(ctx context.Context, client redis.UniversalClient, query *MembersQuery) (*MembersQueryResult, error) {
	keys, cur, err := client.SScan(ctx, query.Key, query.Cursor, query.Match, query.Count).Result()
	if err != nil {
		return nil, serr.WithStack(err)
	}
	if len(keys) < int(query.Count) && cur > 0 {
		// if return keys is less than count limit, but has cursor
		var leftKeys []string
		// then keep read left keys
		keys, cur, err = client.SScan(ctx, query.Key, query.Cursor, query.Match, query.Count).Result()
		// and append it to results
		keys = append(keys, leftKeys...)
	}

	r := new(MembersQueryResult)
	r.Members = make([]*MemberResult, 0, len(keys))
	r.Cursor = cur
	for _, value := range keys {
		r.Members = append(r.Members, &MemberResult{
			Field: value,
			Value: value,
		})
	}
	return r, nil
}
