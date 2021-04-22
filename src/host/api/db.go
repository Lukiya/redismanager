package api

import (
	"encoding/json"
	"errors"

	"github.com/Lukiya/redismanager/src/go/common"
	"github.com/Lukiya/redismanager/src/go/rmr"

	"github.com/syncfuture/go/u"
	"github.com/syncfuture/host"
)

var DBGroup = host.NewActionGroup(
	nil,
	[]*host.Action{
		host.NewAction("POST/api/servers/{serverID}/{db}/scan", "key__", GetKeysOrElements),
		host.NewAction("GET/api/servers/{serverID}/{db}/{key}", "key__", GetKey),
		host.NewAction("POST/api/servers/{serverID}/{db}/{key}", "key__", GetValue),
		host.NewAction("POST/api/servers/{serverID}/{db}/save", "key__", SaveEntry),
		host.NewAction("DELETE/api/servers/{serverID}/{db}/{key}", "key__", DeleteEntry),
	},
	nil,
)

func GetKeysOrElements(ctx host.IHttpContext) {
	dB, err := getDB(ctx)
	if host.HandleErr(err, ctx) {
		return
	}

	scanQuerySet := new(rmr.ScanQuerySet)
	err = ctx.ReadJSON(scanQuerySet)
	if host.HandleErr(err, ctx) {
		return
	}

	if scanQuerySet.Key == "" {
		// Scan keys
		var rs *rmr.ScanKeyResult
		if scanQuerySet.Queries == nil {
			rs, err = dB.ScanKeys(scanQuerySet)
		} else {
			rs, err = dB.ScanMoreKeys(scanQuerySet)
		}
		if host.HandleErr(err, ctx) {
			return
		}

		data, err := json.Marshal(rs)
		if host.HandleErr(err, ctx) {
			return
		}

		ctx.WriteJsonBytes(data)
	} else {
		// scan members
		rs, err := dB.GetElements(scanQuerySet)
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

	element := ctx.GetFormString("Element")
	if host.HandleErr(err, ctx) {
		return
	}

	v, err := redisKey.GetValue(element)
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
func DeleteEntry(ctx host.IHttpContext) {
	db, err := getDB(ctx)
	if host.HandleErr(err, ctx) {
		return
	}

	cmd := new(rmr.DeleteRedisEntryCommand)
	cmd.Key = ctx.GetParamString("key")
	cmd.Element = ctx.GetFormString("Element")

	if cmd.Element == "" {
		err = db.DeleteKey(cmd.Key)
	} else {
		err = db.DeleteElement(cmd.Key, cmd.Element)
	}
}
