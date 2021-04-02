package api

import (
	"time"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/go-redis/redis/v7"
	"github.com/syncfuture/go/u"
)

func saveTTL(client redis.Cmdable, cmd *core.SaveRedisEntryCommand) (err error) {
	if cmd.Editing.TTL != cmd.Backup.TTL {
		// Need update ttl
		if cmd.Editing.TTL > 0 {
			err = client.Expire(cmd.Editing.Key, time.Duration(cmd.Editing.TTL)*time.Second).Err()
			u.LogError(err)
		} else {
			err = client.Persist(cmd.Editing.Key).Err()
			u.LogError(err)
		}
	}
	return
}
