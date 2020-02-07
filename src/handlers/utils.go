package handlers

import (
	"strconv"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/go-redis/redis/v7"
	"github.com/kataras/iris/v12"
	u "github.com/syncfuture/go/util"
)

func getClient(ctx iris.Context) (r redis.Cmdable) {
	if core.ClusterClient == nil {
		dbStr := ctx.FormValueDefault("db", "0")
		db, err := strconv.Atoi(dbStr)
		if u.LogError(err) {
			return nil
		}
		return core.DBClients[db]
	} else {
		return core.ClusterClient
	}
}

func handleError(ctx iris.Context, err error) bool {
	if u.LogError(err) {
		ctx.WriteString(err.Error())
		return true
	}
	return false
}
