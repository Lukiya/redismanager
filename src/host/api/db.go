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
		host.NewAction("POST/api/servers/{serverID}/{db}/scan", "key__", ScanKeysOrElements),
		host.NewAction("GET/api/servers/{serverID}/{db}/{key}", "key__", GetKey),
		host.NewAction("POST/api/servers/{serverID}/{db}/{key}", "key__", GetValue),
		host.NewAction("POST/api/servers/{serverID}/{db}/save", "key__", SaveEntry),
		host.NewAction("DELETE/api/servers/{serverID}/{db}/{key}", "key__", DeleteEntry),
	},
	nil,
)

func ScanKeysOrElements(ctx host.IHttpContext) {
	dB, err := getDB(ctx)
	if host.HandleErr(err, ctx) {
		return
	}

	querySet := new(rmr.ScanQuerySet)
	err = ctx.ReadJSON(querySet)
	if host.HandleErr(err, ctx) {
		return
	}

	if querySet.Key == "" {
		// Scan keys
		var rs *rmr.ScanKeyResult
		if querySet.All {
			rs, err = dB.GetAllKeys(querySet)
		} else if querySet.Cursors == nil {
			rs, err = dB.ScanKeys(querySet)
		} else {
			rs, err = dB.ScanMoreKeys(querySet)
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
		var rs *rmr.ScanElementResult
		if querySet.All {
			rs, err = dB.GetAllElements(querySet)
			if host.HandleErr(err, ctx) {
				return
			}
		} else {
			rs, err = dB.ScanElements(querySet)
			if host.HandleErr(err, ctx) {
				return
			}
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

	elementKey := ctx.GetFormString("ElementKey")
	if host.HandleErr(err, ctx) {
		return
	}

	v, err := redisKey.GetValue(elementKey)
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
