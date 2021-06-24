package main

import (
	"embed"

	"github.com/Lukiya/redismanager/src/go/api"
	"github.com/Lukiya/redismanager/src/go/core"
	log "github.com/syncfuture/go/slog"
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

	log.Info("-------------------------------------------------")
	log.Infof("App name:\t%s", AppName)
	log.Infof("App version:\t%s", AppVersion)
	log.Infof("Build version:\t%s", BuildVersion)
	log.Infof("Build time:\t%s", BuildTime)
	log.Infof("Git branch:\t%s", GitBranch)
	log.Infof("Golang: \t%s", GoVersion)
	log.Info("-------------------------------------------------")

	log.Fatal(core.Host.Run())
}
