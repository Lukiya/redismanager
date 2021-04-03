package api

import (
	"encoding/json"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/Lukiya/redismanager/src/go/rmr"
	"github.com/syncfuture/go/serr"
	"github.com/syncfuture/host"
)

var ClusterGroup = host.NewActionGroup(
	nil,
	[]*host.Action{
		host.NewAction("POST/api/cluster", "cluster__", SaveCluster),
		host.NewAction("GET/api/clusters", "cluster__", GetClusters),
		host.NewAction("POST/api/clusters/{id}", "cluster__", SelectCluster),
		host.NewAction("DELETE/api/clusters/{id}", "cluster__", RemoveCluster),
	},
	nil,
)

// SelectCluster POST /api/cluster
func SaveCluster(ctx host.IHttpContext) {
	var cluster *rmr.ClusterConfig
	ctx.ReadJSON(&cluster)
	if cluster == nil {
		host.HandleErr(serr.New("cluster json is missing in request body"), ctx)
		return
	}

	err := core.Manager.Save(cluster)
	host.HandleErr(err, ctx)
}

// GetClusters Get /api/clusters
func GetClusters(ctx host.IHttpContext) {
	data, err := json.Marshal(core.Manager.Configs)
	if host.HandleErr(err, ctx) {
		return
	}

	ctx.Write(data)
}

// SelectCluster Post /api/clusters/{id}
func SelectCluster(ctx host.IHttpContext) {
	id := ctx.GetParamString("id")
	if id == "" {
		host.HandleErr(serr.New("id is required"), ctx)
		return
	}

	err := core.Manager.Select(id)
	host.HandleErr(err, ctx)
}

// RemoveCluster Delete /api/clusters/{id}
func RemoveCluster(ctx host.IHttpContext) {
	id := ctx.GetParamString("id")
	if id == "" {
		host.HandleErr(serr.New("id is required"), ctx)
		return
	}

	err := core.Manager.Remove(id)
	host.HandleErr(err, ctx)
}
