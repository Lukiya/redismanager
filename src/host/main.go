package main

import (
	"fmt"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/Lukiya/redismanager/src/go/handlers"
	"github.com/kataras/iris/v12"
	"github.com/kataras/iris/v12/core/router"
	"github.com/kataras/iris/v12/middleware/logger"
	"github.com/kataras/iris/v12/middleware/recover"
)

func newApp() *iris.Application {
	app := iris.New()
	logLevel := core.ConfigProvider.GetStringDefault("Log.Level", "info")
	app.Logger().SetLevel(logLevel)
	app.Use(recover.New())
	app.Use(logger.New())

	var v1 router.Party

	if core.Debug {
		// Debug mode
		app.HandleDir("/", "./dist")
		crs := func(ctx iris.Context) {
			ctx.Header("Access-Control-Allow-Origin", "*")
			ctx.Header("Access-Control-Allow-Credentials", "true")
			ctx.Header("Access-Control-Allow-Methods", "DELETE")
			ctx.Header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, Content-Type")
			ctx.Next()
		}

		v1 = app.Party("/api/v1", crs).AllowMethods(iris.MethodOptions)
	} else {
		// Production mode
		app.HandleDir("/", "./dist", iris.DirOptions{
			Asset:      Asset,
			AssetInfo:  AssetInfo,
			AssetNames: AssetNames,
		})
		v1 = app.Party("/api/v1")
	}

	// Register api routes
	v1.Get("/keys", handlers.GetKeys)
	v1.Get("/dbs", handlers.GetDBs)
	v1.Get("/configs", handlers.GetConfigs)
	v1.Get("/entry", handlers.GetEntry)
	v1.Get("/hash", handlers.GetHashElements)
	v1.Get("/list", handlers.GetListElements)
	v1.Get("/set", handlers.GetSetElements)
	v1.Get("/zset", handlers.GetZSetElements)
	v1.Post("/entry", handlers.SaveEntry)
	v1.Post("/export/keys", handlers.ExportKeys)
	v1.Post("/import/keys", handlers.ImportKeys)
	v1.Post("/export/file", handlers.ExportFile)
	v1.Post("/import/file", handlers.ImportFile)
	v1.Delete("/keys", handlers.DeleteKeys)
	v1.Delete("/members", handlers.DeleteMembers)

	return app
}

func main() {
	fmt.Println("------------------------------------------------")
	fmt.Println("-             Redis Manager v1.1.0             -")
	fmt.Println("------------------------------------------------")
	app := newApp()
	listenAddr := core.ConfigProvider.GetStringDefault("ListenAddr", ":16379")
	app.Run(iris.Addr(listenAddr))
}
