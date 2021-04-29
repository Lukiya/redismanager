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
		host.NewAction("POST/api/servers/{serverID}/{db}/scan", "key__", ScanKeysOrElements),
		host.NewAction("GET/api/servers/{serverID}/{db}/{key}", "key__", GetKey),
		host.NewAction("POST/api/servers/{serverID}/{db}/{key}", "key__", GetRedisEntry),
		host.NewAction("POST/api/servers/{serverID}/{db}/save", "key__", SaveRedisEntry),
		host.NewAction("DELETE/api/servers/{serverID}/{db}", "key__", DeleteRedisEntries),
	},
	nil,
)

func ScanKeysOrElements(ctx host.IHttpContext) {
	db, err := getDB(ctx)
	if err != nil {
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
			rs, err = db.GetAllKeys(querySet)
		} else if querySet.Cursors == nil {
			rs, err = db.ScanKeys(querySet)
		} else {
			rs, err = db.ScanMoreKeys(querySet)
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
			rs, err = db.GetAllElements(querySet)
			if host.HandleErr(err, ctx) {
				return
			}
		} else {
			rs, err = db.ScanElements(querySet)
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

func GetRedisEntry(ctx host.IHttpContext) {
	db, err := getDB(ctx)
	if err != nil {
		return
	}

	key := ctx.GetParamString("key")
	key, err = url.PathUnescape(key)
	if host.HandleErr(err, ctx) {
		return
	}

	elementKey := ctx.GetFormString("ElementKey")
	if host.HandleErr(err, ctx) {
		return
	}

	r, err := db.GetRedisEntry(key, elementKey)
	if host.HandleErr(err, ctx) {
		return
	}

	data, err := json.Marshal(r)
	if host.HandleErr(err, ctx) {
		return
	}

	ctx.WriteJsonBytes(data)
}

func SaveRedisEntry(ctx host.IHttpContext) {
	db, err := getDB(ctx)
	if err != nil {
		return
	}

	var cmd *rmr.SaveRedisEntryCommand
	ctx.ReadJSON(&cmd)

	err = db.SaveEntry(cmd)
	if errors.Is(err, common.KeyExistError) {
		ctx.WriteJsonBytes(u.StrToBytes(`{"err":"` + err.Error() + `"}`))
		return
	} else if host.HandleErr(err, ctx) {
		return
	}
}

func DeleteRedisEntries(ctx host.IHttpContext) {
	db, err := getDB(ctx)
	if err != nil {
		return
	}

	var cmd *rmr.DeleteRedisEntriesCommand
	ctx.ReadJSON(&cmd)

	err = db.DeleteEntries(cmd)
	if host.HandleErr(err, ctx) {
		return
	}
}
