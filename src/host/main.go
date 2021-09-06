package main

import (
	"embed"
	"fmt"
	"strings"

	"github.com/Lukiya/redismanager/src/go/api"
	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/PuerkitoBio/goquery"
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
		doc, err := goquery.NewDocument("https://github.com/Lukiya/redismanager/releases")
		var liveVersion string
		if !u.LogError(err) {
			liveVersion = doc.Find(".release-header .f1 a").First().Text()
			liveVersion = strings.TrimSpace(liveVersion)
		}

		if liveVersion == "" {
			liveVersion = "v1.0.0"
		}

		if AppVersion == "" {
			AppVersion = "v1.0.0"
		}

		json := fmt.Sprintf(`{"version":"%s","liveVersion":"%s"}`, AppVersion, liveVersion)
		ctx.WriteJsonBytes(u.StrToBytes(json))
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
