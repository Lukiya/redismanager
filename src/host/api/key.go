package api

import (
	"encoding/json"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/Lukiya/redismanager/src/go/rmr"

	log "github.com/syncfuture/go/slog"
	"github.com/syncfuture/host"
)

var KeyGroup = host.NewActionGroup(
	nil,
	[]*host.Action{
		host.NewAction("GET/api/servers/{serverID}/{nodeID}/{db}", "key__", GetKeys),
		host.NewAction("GET/api/servers/{serverID}/{nodeID}/{db}/{key}", "key__", GetKey),
		host.NewAction("GET/api/servers/{serverID}/{nodeID}/{db}/{key}/{field}", "key__", GetValue),
		host.NewAction("POST/api/servers/{serverID}/{nodeID}/{db}/{key}/{field}", "key__", SaveEntry),
	},
	nil,
)

func GetKeys(ctx host.IHttpContext) {
	serverID := ctx.GetParamString("serverID")
	nodeID := ctx.GetParamString("nodeID")
	db := ctx.GetParamInt("db")
	query := new(rmr.KeyQuery)
	err := ctx.ReadQuery(query)
	if host.HandleErr(err, ctx) {
		return
	}

	Server := core.Manager.GetServer(serverID)
	if Server == nil {
		log.Warnf("cannot find Server '%s'", serverID)
		return
	}

	node := Server.GetNode(nodeID)
	if node == nil {
		log.Warnf("cannot find node '%s/%s'", serverID, nodeID)
		return
	}

	dB, err := node.GetDB(db)
	if host.HandleErr(err, ctx) {
		return
	}

	rs, err := dB.GetKeys(query)
	if host.HandleErr(err, ctx) {
		return
	}

	data, err := json.Marshal(rs)
	if host.HandleErr(err, ctx) {
		return
	}

	ctx.WriteJsonBytes(data)
}

func GetKey(ctx host.IHttpContext) {
	redisKey, err := getKey(ctx)
	if host.HandleErr(err, ctx) {
		return
	}

	data, err := json.Marshal(redisKey)
	if host.HandleErr(err, ctx) {
		return
	}

	ctx.WriteJsonBytes(data)
}

func GetValue(ctx host.IHttpContext) {
	redisKey, err := getKey(ctx)
	if host.HandleErr(err, ctx) {
		return
	}

	field := ctx.GetParamString("field")
	v, err := redisKey.GetValue(field)
	if host.HandleErr(err, ctx) {
		return
	}

	ctx.WriteString(v)
}

func SaveEntry(ctx host.IHttpContext) {
	db, err := getDB(ctx)
	if host.HandleErr(err, ctx) {
		return
	}

	var cmd *rmr.SaveRedisEntryCommand
	ctx.ReadJSON(&cmd)

	err = db.SaveValue(cmd)
	if host.HandleErr(err, ctx) {
		return
	}
}
