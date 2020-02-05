package handlers

import (
	"time"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/go-redis/redis/v7"
)

func saveString(client redis.Cmdable, cmd *core.SaveRedisEntryCommand) (err error) {
	if cmd.Editing.IsNew {
		err = client.Set(cmd.Editing.Key, cmd.Editing.Value, time.Duration(-1)).Err()
	} else {

	}
	return err
}
