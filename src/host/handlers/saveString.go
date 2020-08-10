package handlers

import (
	"time"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/go-redis/redis/v7"
	"github.com/syncfuture/go/u"
)

func saveString(client redis.Cmdable, cmd *core.SaveRedisEntryCommand) (err error) {
	if cmd.Editing.IsNew {
		err = client.Set(cmd.Editing.Key, cmd.Editing.Value, time.Duration(-1)).Err()
		u.LogError(err)
	} else if cmd.Editing.Key != cmd.Backup.Key {
		// rename key
		err = client.Rename(cmd.Backup.Key, cmd.Editing.Key).Err()
		u.LogError(err)
	} else {
		err = client.Set(cmd.Editing.Key, cmd.Editing.Value, time.Duration(-1)).Err()
		u.LogError(err)
	}
	return
}
