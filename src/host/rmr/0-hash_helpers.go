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
