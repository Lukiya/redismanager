package rmr

import (
	"context"
	"strconv"

	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/serr"
)

func saveList(ctx context.Context, client redis.UniversalClient, cmd *SaveRedisEntryCommand) (err error) {
	if cmd.IsNew {
		err = client.RPush(ctx, cmd.New.Key, cmd.New.Value).Err()
		if err != nil {
			return serr.WithStack(err)
		}
	} else if cmd.New.Key != cmd.Old.Key {
		// rename key
		err = client.Rename(ctx, cmd.Old.Key, cmd.New.Key).Err()
		if err != nil {
			return serr.WithStack(err)
		}
	} else {
		// # update value
		index, err := strconv.ParseInt(cmd.New.Field, 10, 64)
		if err != nil {
			return serr.WithStack(err)
		}
		err = client.LSet(ctx, cmd.New.Key, index, cmd.New.Value).Err()
		if err != nil {
			return serr.WithStack(err)
		}
	}

	return
}
