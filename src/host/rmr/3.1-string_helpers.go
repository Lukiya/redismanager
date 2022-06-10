package rmr

import (
	"context"
	"time"

	"github.com/Lukiya/redismanager/src/go/shared"
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

	if cmd.IsNew {
		// Check if new key is existing
		exists, err := keyExists(ctx, client, cmd.New.Key)
		if err != nil {
			return err
		}

		if exists {
			return shared.KeyExistsError
		}
	} else {
		err := renameKey(ctx, client, clusterClient, cmd.Old.Key, cmd.New.Key)
		if err != nil {
			return err
		}
	}

	err := client.Set(ctx, cmd.New.Key, cmd.New.Value, time.Duration(0)).Err()
	if err != nil {
		return serr.WithStack(err)
	}
	return nil
}
