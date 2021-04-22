package rmr

import (
	"context"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/serr"
)

func saveTTL(ctx context.Context, client redis.UniversalClient, clusterClient *redis.ClusterClient, cmd *SaveRedisEntryCommand) (err error) {
	if clusterClient != nil {
		var err error
		client, err = clusterClient.MasterForKey(ctx, cmd.New.Key)
		if err != nil {
			return serr.WithStack(err)
		}
	}

	if cmd.New.TTL != cmd.Old.TTL {
		// Need update ttl
		if cmd.New.TTL > 0 {
			err = client.Expire(ctx, cmd.New.Key, time.Duration(cmd.New.TTL)*time.Second).Err()
			if err != nil {
				return serr.WithStack(err)
			}
		} else {
			err = client.Persist(ctx, cmd.New.Key).Err()
			if err != nil {
				return serr.WithStack(err)
			}
		}
	}
	return
}
