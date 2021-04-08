package rmr

import (
	"context"
	"strconv"

	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/serr"
)

func saveZSet(ctx context.Context, client redis.UniversalClient, cmd *SaveRedisEntryCommand) error {
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
		err = client.Rename(ctx, cmd.Old.Key, cmd.New.Key).Err()
		if err != nil {
			return serr.WithStack(err)
		}
	} else {
		err = client.ZRem(ctx, cmd.Old.Key, cmd.Old.Value).Err()
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
