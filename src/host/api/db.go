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
		host.NewAction("POST/api/servers/{serverID}/{db}", "key__", GetKeysOrMembers),
		host.NewAction("GET/api/servers/{serverID}/{db}/{key}", "key__", GetKey),
		host.NewAction("POST/api/servers/{serverID}/{db}/{key}", "key__", GetValue),
		host.NewAction("POST/api/servers/{serverID}/{db}", "key__", SaveEntry),
	},
	nil,
)

func GetKeysOrMembers(ctx host.IHttpContext) {
	dB, err := getDB(ctx)
	if host.HandleErr(err, ctx) {
		return
	}

	scanQuery := new(rmr.ScanQuerySet)
	err = ctx.ReadJSON(scanQuery)
	if host.HandleErr(err, ctx) {
		return
	}

	if scanQuery.Key == "" {
		// Scan keys
		var rs map[string]*rmr.KeyQueryResult
		if scanQuery.Queries == nil {
			rs, err = dB.ScanKeys(scanQuery.Query)
		} else {
			rs, err = dB.ScanMoreKeys(scanQuery.Queries)
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
		rs, err := dB.GetMembers(scanQuery)
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

	field := ctx.GetFormString("field")
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
