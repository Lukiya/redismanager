package handlers

import (
	"strconv"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/go-redis/redis/v7"
)

func saveList(client redis.Cmdable, cmd *core.SaveRedisEntryCommand) (err error) {
	if cmd.Editing.IsNew {
		err = client.RPush(cmd.Editing.Key, cmd.Editing.Value).Err()
	} else {
		var index int64
		index, err = strconv.ParseInt(cmd.Editing.Field, 10, 64)
		if err != nil {
			return err
		}
		err = client.LSet(cmd.Editing.Key, index, cmd.Editing.Value).Err()
	}
	return err
}
