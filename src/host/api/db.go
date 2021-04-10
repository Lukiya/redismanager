package api

import (
	"encoding/json"
	"errors"
	"net/url"

	"github.com/Lukiya/redismanager/src/go/common"
	"github.com/Lukiya/redismanager/src/go/rmr"

	"github.com/syncfuture/go/u"
	"github.com/syncfuture/host"
)

var DBGroup = host.NewActionGroup(
	nil,
	[]*host.Action{
		host.NewAction("GET/api/servers/{serverID}/{nodeID}/{db}", "key__", GetMembers),
		host.NewAction("GET/api/servers/{serverID}/{nodeID}/{db}/{key}", "key__", GetKey),
		host.NewAction("GET/api/servers/{serverID}/{nodeID}/{db}/{key}/{field}", "key__", GetValue),
		host.NewAction("POST/api/servers/{serverID}/{nodeID}/{db}", "key__", SaveEntry),
	},
	nil,
)

func GetMembers(ctx host.IHttpContext) {
	dB, err := getDB(ctx)
	if host.HandleErr(err, ctx) {
		return
	}

	key := ctx.GetFormString("Key")
	if key == "" {
		query := new(rmr.KeysQuery)
		err := ctx.ReadQuery(query)
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
	} else {
		query := new(rmr.MembersQuery)
		err := ctx.ReadQuery(query)
		if host.HandleErr(err, ctx) {
			return
		}
		rs, err := dB.GetMembers(query)
		if host.HandleErr(err, ctx) {
			return
		}

		data, err := json.Marshal(rs)
		if host.HandleErr(err, ctx) {
			return
		}

		ctx.WriteJsonBytes(data)
	}
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
	field, err = url.PathUnescape(field)
	if host.HandleErr(err, ctx) {
		return
	}

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

	if errors.Is(err, common.KeyExistError) {
		ctx.WriteJsonBytes(u.StrToBytes(`{"err":"` + err.Error() + `"}`))
		return
	} else if host.HandleErr(err, ctx) {
		return
	}

	ctx.WriteJsonBytes(u.StrToBytes(`{"err":""}`))
}
