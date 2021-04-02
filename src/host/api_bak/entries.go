package apibak

import (
	"encoding/json"
	"strings"

	"github.com/syncfuture/go/serr"
	"github.com/syncfuture/host"

	"github.com/go-redis/redis/v7"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/Lukiya/redismanager/src/go/helpers"
)

// GetEntry Get /api/entry?key={0}&field={1}
func GetEntry(ctx host.IHttpContext) {
	key := ctx.GetFormString("key")
	if key == "" {
		ctx.WriteString("key is missing in query")
		return
	}
	field := ctx.GetFormString("field")

	client := helpers.GetClient(ctx)
	// if client == nil {
	// 	return
	// }

	entry := core.NewRedisEntry(client, key)
	entry.GetValue(field)

	bytes, err := json.Marshal(entry)
	if host.HandleErr(err, ctx) {
		return
	}
	ctx.SetContentType(core.ContentTypeJson)
	ctx.Write(bytes)
}

// SaveEntry Post /api/entry
func SaveEntry(ctx host.IHttpContext) {
	cmd := new(core.SaveRedisEntryCommand)
	ctx.ReadJSON(cmd)

	if cmd.Editing == nil {
		ctx.WriteString("editing entry is missing")
		return
	} else if strings.TrimSpace(cmd.Editing.Key) == "" {
		ctx.WriteString("editing key is missing")
		return
	}

	client := helpers.GetClient(ctx)

	////////// Save entry by type
	switch cmd.Editing.Type {
	case core.RedisType_String:
		err := saveString(client, cmd)

		if host.HandleErr(err, ctx) {
			return
		}
		break
	case core.RedisType_Hash:
		err := saveHash(client, cmd)
		if host.HandleErr(err, ctx) {
			return
		}
		break
	case core.RedisType_List:
		err := saveList(client, cmd)
		if host.HandleErr(err, ctx) {
			return
		}
		break
	case core.RedisType_Set:
		err := saveSet(client, cmd)
		if host.HandleErr(err, ctx) {
			return
		}
		break
	case core.RedisType_ZSet:
		err := saveZSet(client, cmd)
		if host.HandleErr(err, ctx) {
			return
		}
		break
	default:
		err := serr.Errorf("type '%s' does not support yet", cmd.Editing.Type)
		if host.HandleErr(err, ctx) {
			return
		}
		break
	}

	////////// save TTL
	err := saveTTL(client, cmd)

	if host.HandleErr(err, ctx) {
		return
	}
}

// GetHashElements Get /api/hash?key={0}
func GetHashElements(ctx host.IHttpContext) {
	key := ctx.GetFormString("key")
	if key == "" {
		ctx.WriteString("key is missing in query")
		return
	}

	client := helpers.GetClient(ctx)
	// if client == nil {
	// 	return
	// }

	v, err := client.HGetAll(key).Result()
	if host.HandleErr(err, ctx) {
		return
	}

	ctx.SetContentType(core.ContentTypeJson)
	if len(v) > 0 {
		bytes, err := json.Marshal(v)
		if host.HandleErr(err, ctx) {
			return
		}

		ctx.Write(bytes)
	} else {
		ctx.WriteString("[]")
	}
}

// GetListElements Get /api/list?key={0}
func GetListElements(ctx host.IHttpContext) {
	key := ctx.GetFormString("key")
	if key == "" {
		ctx.WriteString("key is missing in query")
		return
	}

	client := helpers.GetClient(ctx)
	// if client == nil {
	// 	return
	// }

	v, err := client.LRange(key, 0, -1).Result()
	if host.HandleErr(err, ctx) {
		return
	}

	ctx.SetContentType(core.ContentTypeJson)
	if len(v) > 0 {
		bytes, err := json.Marshal(v)
		if host.HandleErr(err, ctx) {
			return
		}

		ctx.Write(bytes)
	} else {
		ctx.WriteString("[]")
	}
}

// GetSetElements Get /api/set?key={0}
func GetSetElements(ctx host.IHttpContext) {
	key := ctx.GetFormString("key")
	if key == "" {
		ctx.WriteString("key is missing in query")
		return
	}

	client := helpers.GetClient(ctx)
	// if client == nil {
	// 	return
	// }

	v, err := client.SMembers(key).Result()
	if host.HandleErr(err, ctx) {
		return
	}

	ctx.SetContentType(core.ContentTypeJson)
	if len(v) > 0 {
		bytes, err := json.Marshal(v)
		if host.HandleErr(err, ctx) {
			return
		}

		ctx.Write(bytes)
	} else {
		ctx.WriteString("[]")
	}
}

// GetZSetElements Get /api/zset?key={0}
func GetZSetElements(ctx host.IHttpContext) {
	key := ctx.GetFormString("key")
	if key == "" {
		ctx.WriteString("key is missing in query")
		return
	}

	client := helpers.GetClient(ctx)
	// if client == nil {
	// 	return
	// }

	v, err := client.ZRangeByScoreWithScores(key, &redis.ZRangeBy{
		Min: "-inf",
		Max: "+inf",
		// Offset: 0,
		// Count:  2,
	}).Result()
	if host.HandleErr(err, ctx) {
		return
	}

	ctx.SetContentType(core.ContentTypeJson)
	if len(v) > 0 {
		bytes, err := json.Marshal(v)
		if host.HandleErr(err, ctx) {
			return
		}

		ctx.Write(bytes)
	} else {
		ctx.WriteString("[]")
	}
}
