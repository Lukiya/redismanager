package rmr

import (
	"context"

	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/serr"
)

func saveHash(ctx context.Context, client redis.UniversalClient, cmd *SaveRedisEntryCommand) (err error) {
	if cmd.IsNew {
		err = client.HSet(ctx, cmd.New.Key, cmd.New.Field, cmd.New.Value).Err()
		if err != nil {
			return serr.WithStack(err)
		}
	} else if cmd.New.Key != cmd.Old.Key {
		// # rename key
		err = client.Rename(ctx, cmd.Old.Key, cmd.New.Key).Err()
		if err != nil {
			return serr.WithStack(err)
		}

		if cmd.New.Field != cmd.Old.Field {
			// #rename field while renaming key
			err = renameHashField(ctx, client, cmd.New.Key, cmd.Old.Field, cmd.New.Field, cmd.New.Value)
			if err != nil {
				return err
			}
		}

	} else if cmd.New.Field != cmd.Old.Field {
		// # rename field
		err = renameHashField(ctx, client, cmd.New.Key, cmd.Old.Field, cmd.New.Field, cmd.New.Value)
		if err != nil {
			return err
		}
	}

	if cmd.New.Field != "" {
		// # update value
		err = client.HSet(ctx, cmd.New.Key, cmd.New.Field, cmd.New.Value).Err()
		if err != nil {
			return serr.WithStack(err)
		}
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

func getHashMembers(ctx context.Context, client redis.UniversalClient, query *MembersQuery) (*MembersQueryResult, error) {
	keys, cur, err := client.HScan(ctx, query.Key, query.Cursor, query.Match, query.Count).Result()
	if err != nil {
		return nil, serr.WithStack(err)
	}
	if len(keys) < int(query.Count) && cur > 0 {
		// if return keys is less than count limit, but has cursor
		var leftKeys []string
		// then keep read left keys
		keys, cur, err = client.HScan(ctx, query.Key, query.Cursor, query.Match, query.Count).Result()
		// and append it to results
		keys = append(keys, leftKeys...)
	}

	r := new(MembersQueryResult)
	r.Members = make([]*MemberResult, 0, query.Count)
	r.Cursor = cur
	for i := range keys {
		if i%2 == 0 {
			r.Members = append(r.Members, &MemberResult{
				Field: keys[i],
				Value: keys[i+1],
			})
		}
	}
	return r, nil
}
