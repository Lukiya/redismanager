package api

import (
	"encoding/json"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/Lukiya/redismanager/src/go/rmr"
	"github.com/Lukiya/redismanager/src/go/shared"
	"github.com/syncfuture/go/serr"
	log "github.com/syncfuture/go/slog"
	"github.com/syncfuture/go/u"
	"github.com/syncfuture/host"
)

var ServerGroup = host.NewActionGroup(
	nil,
	[]*host.Action{
		host.NewAction("POST/api/server", "server__", SaveServer),
		host.NewAction("GET/api/servers", "server__", GetServers),
		host.NewAction("GET/api/servers/{id}", "server__", GetServer),
		host.NewAction("POST/api/servers/{id}", "server__", SelectServer),
		host.NewAction("DELETE/api/servers/{id}", "server__", RemoveServer),
		host.NewAction("POST/api/servers/{id}/bgsave", "server__", ServerBGSave),
	},
	nil,
)

// SelectServer POST /api/server
func SaveServer(ctx host.IHttpContext) {
	var server *rmr.ServerConfig
	ctx.ReadJSON(&server)
	if server == nil {
		host.HandleErr(serr.New("server json is missing in request body"), ctx)
		return
	}

	err := core.Manager.Save(server)
	host.HandleErr(err, ctx)
}

// GetServers Get /api/servers
func GetServers(ctx host.IHttpContext) {
	data, err := json.Marshal(core.Manager.Configs)
	if host.HandleErr(err, ctx) {
		return
	}

	ctx.Write(data)
}

// GetServers Get /api/server/{id}
func GetServer(ctx host.IHttpContext) {
	serverID := ctx.GetParamString("id")
	var server *rmr.RedisServer
	var err error
	if serverID == "selected" {
		server, err = core.Manager.GetSelectedServer()
		if serr.Is(err, shared.ConnectServerFailedError) {
			ctx.WriteJsonBytes(u.StrToBytes(`{"err":"` + err.Error() + `"}`))
			return
		} else if host.HandleErr(err, ctx) {
			return
		}
	} else {
		server, err = core.Manager.GetServer(serverID)
		if serr.Is(err, shared.ConnectServerFailedError) {
			ctx.WriteJsonBytes(u.StrToBytes(`{"err":"` + err.Error() + `"}`))
			return
		} else if host.HandleErr(err, ctx) {
			return
		}
	}

	if server == nil {
		log.Debugf("server '%s' is nil", serverID)
		return
	}

	data, err := json.Marshal(server)
	if host.HandleErr(err, ctx) {
		return
	}

	ctx.WriteJsonBytes(data)
}

// SelectServer Post /api/servers/{id}
func SelectServer(ctx host.IHttpContext) {
	id := ctx.GetParamString("id")
	if id == "" {
		host.HandleErr(serr.New("id is required"), ctx)
		return
	}

	err := core.Manager.Select(id)
	host.HandleErr(err, ctx)
}

// RemoveServer Delete /api/servers/{id}
func RemoveServer(ctx host.IHttpContext) {
	id := ctx.GetParamString("id")
	if id == "" {
		host.HandleErr(serr.New("id is required"), ctx)
		return
	}

	err := core.Manager.Remove(id)
	host.HandleErr(err, ctx)
}

// ServerBGSave Post /api/servers/{id}/bgsave
func ServerBGSave(ctx host.IHttpContext) {
	id := ctx.GetParamString("id")
	if id == "" {
		host.HandleErr(serr.New("id is required"), ctx)
		return
	}

	server, err := core.Manager.GetServer(id)
	if host.HandleErr(err, ctx) {
		return
	}

	r, err := server.BGSave()
	if host.HandleErr(err, ctx) {
		return
	}

	ctx.WriteString(r)
}
