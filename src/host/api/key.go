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
		host.NewAction("GET/api/clusters/{clusterID}/{nodeID}/{db}/keys", "cluster__", GetKeys),
	},
	nil,
)

func GetKeys(ctx host.IHttpContext) {
	clusterID := ctx.GetParamString("clusterID")
	nodeID := ctx.GetParamString("nodeID")
	db := ctx.GetParamInt("db")

	query := new(rmr.KeysQuery)
	err := ctx.ReadQuery(query)
	if host.HandleErr(err, ctx) {
		return
	}

	cluster := core.Manager.GetCluster(clusterID)
	if cluster == nil {
		log.Warnf("cannot find cluster '%s'", clusterID)
		return
	}

	node := cluster.GetNode(nodeID)
	if node == nil {
		log.Warnf("cannot find node '%s/%s'", clusterID, nodeID)
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
