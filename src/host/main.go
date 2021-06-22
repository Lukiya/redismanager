package main

import (
	"embed"
	"fmt"
	"log"

	"github.com/Lukiya/redismanager/src/go/api"
	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/syncfuture/go/u"
	"github.com/syncfuture/host"
)

//go:embed wwwroot
var staticFiles embed.FS

var (
	AppName      string
	AppVersion   string
	BuildVersion string
	BuildTime    string
	GitRevision  string
	GitBranch    string
	GoVersion    string
)

func main() {
	core.Host.GET("/api/info", func(ctx host.IHttpContext) {
		ctx.WriteJsonBytes(u.StrToBytes(`{"version":"` + AppVersion + `"}`))
	})

	core.Host.AddActionGroups(
		api.ServerGroup,
		api.DBGroup,
	)

	core.Host.ServeEmbedFiles("/{filepath:*}", "wwwroot", staticFiles)

	fmt.Println("------------------------------------------------")
	fmt.Printf("App name:\t%s\n", AppName)
	fmt.Printf("App version:\t%s\n", AppVersion)
	fmt.Printf("Build version:\t%s\n", BuildVersion)
	fmt.Printf("Build time:\t%s\n", BuildTime)
	fmt.Printf("Git revision:\t%s\n", GitRevision)
	fmt.Printf("Git branch:\t%s\n", GitBranch)
	fmt.Printf("Golang: \t%s\n", GoVersion)
	fmt.Println("------------------------------------------------")

	log.Fatal(core.Host.Run())
}
