package api

import (
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

	var query *rmr.KeysQuery

	ctx.ReadQuery(&query)

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

	dB.GetKeys(query)
}
