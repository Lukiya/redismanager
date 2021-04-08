package api

import (
	"net/url"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/Lukiya/redismanager/src/go/rmr"
	"github.com/syncfuture/go/serr"
	"github.com/syncfuture/host"
)

func getDB(ctx host.IHttpContext) (*rmr.RedisDB, error) {
	serverID := ctx.GetParamString("serverID")
	nodeID := ctx.GetParamString("nodeID")
	db := ctx.GetParamInt("db")

	var err error

	Server := core.Manager.GetServer(serverID)
	if Server == nil {
		return nil, serr.Errorf("cannot find Server '%s'", serverID)
	}

	node := Server.GetNode(nodeID)
	if node == nil {
		return nil, serr.Errorf("cannot find node '%s/%s'", serverID, nodeID)
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
	key, err = url.PathUnescape(key)
	if host.HandleErr(err, ctx) {
		return nil, err
	}

	redisKey, err := dB.GetKey(key)
	if host.HandleErr(err, ctx) {
		return nil, err
	}
	return redisKey, nil
}
