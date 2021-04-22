package rmr

import (
	"context"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/serr"
)

func saveString(ctx context.Context, client redis.UniversalClient, clusterClient *redis.ClusterClient, cmd *SaveRedisEntryCommand) error {
	if clusterClient != nil {
		var err error
		client, err = clusterClient.MasterForKey(ctx, cmd.New.Key)
		if err != nil {
			return serr.WithStack(err)
		}
	}

	if !cmd.IsNew {
		err := renameKey(ctx, client, clusterClient, cmd.Old.Key, cmd.New.Key)
		if err != nil {
			return err
		}
	}

	err := client.Set(ctx, cmd.New.Key, cmd.New.Value, time.Duration(-1)).Err()
	if err != nil {
		return serr.WithStack(err)
	}
	return nil
}
