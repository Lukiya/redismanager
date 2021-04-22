package api

import (
	"net/url"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/Lukiya/redismanager/src/go/rmr"
	"github.com/syncfuture/go/serr"
	"github.com/syncfuture/host"
)

func getDB(ctx host.IHttpContext) (rmr.IRedisDB, error) {
	serverID := ctx.GetParamString("serverID")
	// nodeID := ctx.GetParamString("nodeID")
	db := ctx.GetParamInt("db")

	var err error

	server := core.Manager.GetServer(serverID)
	if server == nil {
		return nil, serr.Errorf("cannot find Server '%s'", serverID)
	}

	// node := Server.GetNode(nodeID)
	// if node == nil {
	// 	return nil, serr.Errorf("cannot find node '%s/%s'", serverID, nodeID)
	// }

	dB, err := server.GetDB(db)
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
