package api

import (
	"net/url"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/Lukiya/redismanager/src/go/rmr"
	log "github.com/syncfuture/go/slog"
	"github.com/syncfuture/host"
)

func getDB(ctx host.IHttpContext) (*rmr.RedisDB, error) {
	serverID := ctx.GetParamString("serverID")
	nodeID := ctx.GetParamString("nodeID")
	db := ctx.GetParamInt("db")
	key := ctx.GetParamString("key")
	var err error
	key, err = url.PathUnescape(key)
	if host.HandleErr(err, ctx) {
		return nil, err
	}

	Server := core.Manager.GetServer(serverID)
	if Server == nil {
		log.Warnf("cannot find Server '%s'", serverID)
		return nil, err
	}

	node := Server.GetNode(nodeID)
	if node == nil {
		log.Warnf("cannot find node '%s/%s'", serverID, nodeID)
		return nil, err
	}

	dB, err := node.GetDB(db)
	if host.HandleErr(err, ctx) {
		return nil, err
	}

	return dB, nil
}

func getKey(ctx host.IHttpContext) (*rmr.RedisKey, error) {
	dB, err := getDB(ctx)
	if host.HandleErr(err, ctx) {
		return nil, err
	}

	key := ctx.GetParamString("key")
	redisKey, err := dB.GetKey(key)
	if host.HandleErr(err, ctx) {
		return nil, err
	}

	return redisKey, nil
}
