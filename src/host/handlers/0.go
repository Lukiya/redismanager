package handlers

import (
	"strconv"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/go-redis/redis/v7"
	"github.com/syncfuture/host"
)

func getClient(ctx host.IHttpContext) (r redis.Cmdable) {
	// dbStr := ctx.FormValueDefault("db", "0")
	dbStr := ctx.GetFormString("db")
	if dbStr == "" {
		dbStr = "0"
	}
	db, err := strconv.Atoi(dbStr)
	if host.HandleErr(err, ctx) {
		return nil
	}
	proxy := core.Manager.GetSelectedClientProvider()
	return proxy.GetClient(db)
}

// func handleError(ctx host.IHttpContext, err error) bool {
// 	if err != nil {
// 		// ctx.SetStatusCode(iris.StatusInternalServerError)
// 		ctx.WriteString(err.Error())
// 		return true
// 	}
// 	return false
// }

// func writeErrorString(ctx host.IHttpContext, errStr string) {
// 	// ctx.SetStatusCode(iris.StatusInternalServerError)
// 	ctx.WriteString(errStr)
// }

// func writeMsgResultError(ctx host.IHttpContext, mr *core.MsgResult, err error) bool {
// 	if err != nil {
// 		// ctx.SetStatusCode(iris.StatusInternalServerError)
// 		mr.MsgCode = err.Error()
// 		ctx.WriteString(err.Error())
// 		return true
// 	}
// 	return false
// }

// func writeMsgResult(ctx host.IHttpContext, mr *core.MsgResult, msg string) {
// 	mr.MsgCode = msg
// 	jsonBytes, err := json.Marshal(mr)
// 	u.LogError(err)
// 	ctx.Write(jsonBytes)
// }
