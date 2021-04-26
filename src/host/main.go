package main

import (
	"embed"
	"fmt"
	"log"

	"github.com/Lukiya/redismanager/src/go/api"
	"github.com/Lukiya/redismanager/src/go/common"
	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/syncfuture/go/u"
	"github.com/syncfuture/host"
)

//go:embed wwwroot
var staticFiles embed.FS

func main() {
	core.Host.GET("/api/info", func(ctx host.IHttpContext) {
		ctx.WriteJsonBytes(u.StrToBytes(`{"version":"` + common.Version + `"}`))
	})

	core.Host.AddActionGroups(
		api.ServerGroup,
		api.DBGroup,
	)

	core.Host.ServeEmbedFiles("/{filepath:*}", "wwwroot", staticFiles)

	fmt.Println("------------------------------------------------")
	fmt.Println("-             Redis Manager " + common.Version + "             -")
	fmt.Println("------------------------------------------------")

	log.Fatal(core.Host.Run())
}
