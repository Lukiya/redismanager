package handlers

import (
	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/go-redis/redis/v7"
)

func saveList(client redis.Cmdable, cmd *core.SaveRedisEntryCommand) (err error) {
	if cmd.Editing.IsNew {
		err = client.RPush(cmd.Editing.Key, cmd.Editing.Value).Err()
	} else {

	}
	return err
}
