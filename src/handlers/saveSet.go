package handlers

import (
	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/go-redis/redis/v7"
)

func saveSet(client redis.Cmdable, cmd *core.SaveRedisEntryCommand) (err error) {
	if cmd.Editing.IsNew {
		err = client.SAdd(cmd.Editing.Key, cmd.Editing.Value).Err()
	} else {
		err = client.SRem(cmd.Backup.Key, cmd.Backup.Value).Err()
		if err != nil {
			return err
		}
		err = client.SAdd(cmd.Editing.Key, cmd.Editing.Value).Err()
	}
	return err
}
