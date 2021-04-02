package api

import (
	"strconv"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/go-redis/redis/v7"
	"github.com/syncfuture/go/u"
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
		u.LogError(err)
	} else if cmd.Editing.Key != cmd.Backup.Key {
		// rename key
		err = client.Rename(cmd.Backup.Key, cmd.Editing.Key).Err()
		u.LogError(err)
	} else {
		err = client.ZRem(cmd.Backup.Key, cmd.Backup.Value).Err()
		if err != nil {
			return err
		}
		err = client.ZAdd(cmd.Editing.Key, &redis.Z{
			Score:  score,
			Member: cmd.Editing.Value,
		}).Err()
		u.LogError(err)
	}

	return
}
