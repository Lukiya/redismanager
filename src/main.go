package main

import (
	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/Lukiya/redismanager/src/go/handlers"
	"github.com/iris-contrib/middleware/cors"
	"github.com/kataras/iris/v12"
)

func newApp() *iris.Application {
	app := iris.New()
	app.OnErrorCode(iris.StatusNotFound, func(ctx iris.Context) {
		ctx.Writef("404 not found here")
	})

	if core.Debug {
		app.HandleDir("/", "./dist")
	} else {
		app.HandleDir("/", "./dist", iris.DirOptions{
			Asset:      Asset,
			AssetInfo:  AssetInfo,
			AssetNames: AssetNames,
		})
	}

	crs := cors.New(cors.Options{
		AllowedOrigins: []string{"*"}, // allows everything, use that to change the hosts.
		// AllowCredentials: true,
	})

	v1 := app.Party("/api/v1", crs).AllowMethods(iris.MethodOptions) // <- important for the preflight.
	{
		v1.Get("/keys", handlers.GetKeys)
		v1.Get("/dbs", handlers.GetDBs)
		v1.Get("/configs", handlers.GetConfigs)
		v1.Get("/entry", handlers.GetEntry)
		v1.Get("/hash", handlers.GetHashElements)
		v1.Get("/list", handlers.GetListElements)
		v1.Get("/set", handlers.GetSetElements)
		v1.Get("/zset", handlers.GetZSetElements)
		v1.Post("/entry", handlers.SaveRedisEntry)
		// v1.Post("/min", handlers.Minify)
	}

	return app
}

func main() {
	app := newApp()
	listenAddr := core.ConfigProvider.GetStringDefault("ListenAddr", ":16379")
	app.Run(iris.Addr(listenAddr))
}
