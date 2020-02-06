package handlers

import (
	"strconv"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/go-redis/redis/v7"
)

func saveZSet(client redis.Cmdable, cmd *core.SaveRedisEntryCommand) (err error) {
	var score float64
	if cmd.Editing.Field != "" {
		score, err = strconv.ParseFloat(cmd.Editing.Field, 64)
		if err != nil {
			return err
		}
	}

	if cmd.Editing.IsNew {
		err = client.ZAdd(cmd.Editing.Key, &redis.Z{
			Score:  score,
			Member: cmd.Editing.Value,
		}).Err()
	} else {
		err = client.ZRem(cmd.Backup.Key, cmd.Backup.Value).Err()
		if err != nil {
			return err
		}
		err = client.ZAdd(cmd.Editing.Key, &redis.Z{
			Score:  score,
			Member: cmd.Editing.Value,
		}).Err()
	}

	return err
}
