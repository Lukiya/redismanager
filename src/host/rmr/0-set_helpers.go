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
