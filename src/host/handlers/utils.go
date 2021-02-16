package handlers

import (
	"encoding/json"
	"strconv"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/go-redis/redis/v7"
	"github.com/kataras/iris/v12"
	"github.com/syncfuture/go/u"
)

func getClient(ctx iris.Context) (r redis.Cmdable) {
	dbStr := ctx.FormValueDefault("db", "0")
	db, err := strconv.Atoi(dbStr)
	if u.LogError(err) {
		return nil
	}
	proxy := core.Manager.GetSelectedClientProvider()
	return proxy.GetClient(db)
}

func handleError(ctx iris.Context, err error) bool {
	if err != nil {
		// ctx.StatusCode(iris.StatusInternalServerError)
		ctx.WriteString(err.Error())
		return true
	}
	return false
}

func writeErrorString(ctx iris.Context, errStr string) {
	// ctx.StatusCode(iris.StatusInternalServerError)
	ctx.WriteString(errStr)
}

func writeMsgResultError(ctx iris.Context, mr *core.MsgResult, err error) bool {
	if err != nil {
		// ctx.StatusCode(iris.StatusInternalServerError)
		mr.MsgCode = err.Error()
		ctx.WriteString(err.Error())
		return true
	}
	return false
}

func writeMsgResult(ctx iris.Context, mr *core.MsgResult, msg string) {
	mr.MsgCode = msg
	jsonBytes, err := json.Marshal(mr)
	u.LogError(err)
	ctx.Write(jsonBytes)
}
