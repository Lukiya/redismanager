package handlers

import (
	"strconv"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/go-redis/redis/v7"
	u "github.com/syncfuture/go/util"
)

func saveZSet(client redis.Cmdable, cmd *core.SaveRedisEntryCommand) (err error) {
	var score float64
	score, err = strconv.ParseFloat(cmd.Editing.Field, 64)
	if u.LogError(err) {
		return err
	}

	if cmd.Editing.IsNew {
		err = client.ZAdd(cmd.Editing.Key, &redis.Z{
			Score:  score,
			Member: cmd.Editing.Value,
		}).Err()
	} else {

	}

	u.LogError(err)
	return err
}
