package api

import (
	"encoding/json"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/Lukiya/redismanager/src/go/rmr"
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
	if serverID == "selected" {
		server = core.Manager.GetSelectedServer()
	} else {
		server = core.Manager.Servers[serverID]
	}
	// if helpers.CheckServer(server, ctx) {
	// 	return
	// }

	if server == nil {
		log.Warnf("server '%s' is nil", serverID)
		return
	}

	// load all dbs before return
	for _, v := range server.Nodes {
		err := v.LoadDBs()
		if err != nil {
			u.LogError(serr.Cause(err))
			return
		}
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
