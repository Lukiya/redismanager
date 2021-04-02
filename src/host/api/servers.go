package api

import (
	"encoding/json"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/syncfuture/go/serr"
	"github.com/syncfuture/host"
)

// SelectServer POST /api/server
func SaveServer(ctx host.IHttpContext) {

	// a, _ := io.ReadAll(ctx.Request().Body)
	// log.Debug(string(a))

	var server *core.RedisConfigX
	ctx.ReadJSON(&server)
	if server == nil {
		ctx.WriteString("server json is missing")
		return
	}
	// buffer := _bufferPool.GetBuffer()
	// defer func() {
	// 	ctx.Request().Body.Close()
	// 	_bufferPool.PutBuffer(buffer)
	// }()

	// _, err := buffer.ReadFrom(ctx.Request().Body)
	// if host.HandleErr(err, ctx) {
	// 	return
	// }

	// var server *core.RedisConfigX
	// err = json.Unmarshal(buffer.Bytes(), &server)
	// if host.HandleErr(err, ctx) {
	// 	return
	// }

	err := core.Manager.Save(server)
	host.HandleErr(err, ctx)
}

// GetServers Get /api/servers
func GetServers(ctx host.IHttpContext) {
	data, err := json.Marshal(core.Manager.Servers)
	if host.HandleErr(err, ctx) {
		return
	}

	ctx.Write(data)
}

// // AddServer Post /api/servers
// func AddServer(ctx host.IHttpContext) {
// 	buffer := _bufferPool.GetBuffer()
// 	defer func() {
// 		ctx.Request().Body.Close()
// 		_bufferPool.PutBuffer(buffer)
// 	}()

// 	_, err := buffer.ReadFrom(ctx.Request().Body)
// 	if host.HandleErr(err, ctx) {
// 		return
// 	}

// 	newServers := make([]*core.RedisConfigX, 0)
// 	err = json.Unmarshal(buffer.Bytes(), &newServers)
// 	if host.HandleErr(err, ctx) {
// 		return
// 	}

// 	err = core.Manager.Add(newServers...)
// 	host.HandleErr(err, ctx)
// }

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
