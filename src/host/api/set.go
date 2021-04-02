package api

import (
	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/go-redis/redis/v7"
	"github.com/syncfuture/go/u"
)

func saveSet(client redis.Cmdable, cmd *core.SaveRedisEntryCommand) (err error) {
	if cmd.Editing.IsNew {
		err = client.SAdd(cmd.Editing.Key, cmd.Editing.Value).Err()
		u.LogError(err)
	} else if cmd.Editing.Key != cmd.Backup.Key {
		// rename key
		err = client.Rename(cmd.Backup.Key, cmd.Editing.Key).Err()
		u.LogError(err)
	} else {
		err = client.SRem(cmd.Backup.Key, cmd.Backup.Value).Err()
		if err != nil {
			return
		}
		err = client.SAdd(cmd.Editing.Key, cmd.Editing.Value).Err()
		u.LogError(err)
	}
	return err
}
