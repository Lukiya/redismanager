package rmr

import (
	"context"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/serr"
)

func saveString(ctx context.Context, client redis.UniversalClient, cmd *SaveRedisEntryCommand) error {
	var err error
	if cmd.IsNew {
		err = client.Set(ctx, cmd.New.Key, cmd.New.Value, time.Duration(-1)).Err()
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

	err = client.Set(ctx, cmd.New.Key, cmd.New.Value, time.Duration(-1)).Err()
	if err != nil {
		return serr.WithStack(err)
	}
	return nil
}
