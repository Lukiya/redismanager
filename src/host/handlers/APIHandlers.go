package handlers

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/Lukiya/redismanager/src/go/io"

	"github.com/syncfuture/go/sredis"

	"github.com/go-redis/redis/v7"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/kataras/iris/v12"
	"github.com/syncfuture/go/u"
)

const (
	_defaultMatch = "*"
)

// GetKeys GET /api/v1/keys
func GetKeys(ctx iris.Context) {
	match := ctx.FormValueDefault("match", _defaultMatch)

	entries := make([]*core.RedisEntry, 0)
	if core.ClusterClient != nil {
		mtx := new(sync.Mutex)
		core.ClusterClient.ForEachMaster(func(client *redis.Client) error {
			mtx.Lock() // ForEachMaster is running concurrently, has to lock
			defer mtx.Unlock()

			nodeKeys := sredis.GetAllKeys(client, match, 100)
			for _, key := range nodeKeys {
				keyEntry := core.NewRedisEntry(client, key)
				entries = append(entries, keyEntry)
			}

			return nil
		})
	} else {
		client := getClient(ctx)
		// if client == nil {
		// 	return
		// }
		nodeKeys := sredis.GetAllKeys(client, match, 100)
		for _, key := range nodeKeys {
			keyEntry := core.NewRedisEntry(client, key)
			entries = append(entries, keyEntry)
		}
	}

	bytes, err := json.Marshal(entries)
	if u.LogError(err) {
		return
	}

	ctx.ContentType(core.ContentTypeJson)
	ctx.Write(bytes)
}

// GetDBs GET /api/v1/dbs
func GetDBs(ctx iris.Context) {
	dbCount := len(core.DBClients)
	dbs := make([]int, dbCount)
	for i := 0; i < dbCount; i++ {
		dbs[i] = i
	}

	bytes, err := json.Marshal(dbs)
	if u.LogError(err) {
		return
	}

	ctx.ContentType(core.ContentTypeJson)
	ctx.Write(bytes)
}

// GetConfigs Get /api/v1/configs
func GetConfigs(ctx iris.Context) {
	ctx.ContentType(core.ContentTypeJson)
	bytes, err := ioutil.ReadFile("configs.json")
	if err != nil {
		ctx.WriteString(err.Error())
	} else {
		ctx.Write(bytes)
	}
}

// GetEntry Get /api/v1/entry?key={0}&field={1}
func GetEntry(ctx iris.Context) {
	key := ctx.FormValue("key")
	if key == "" {
		ctx.WriteString("key is missing in query")
		return
	}
	field := ctx.FormValue("field")

	client := getClient(ctx)
	// if client == nil {
	// 	return
	// }

	entry := core.NewRedisEntry(client, key)
	entry.GetValue(field)

	bytes, err := json.Marshal(entry)
	if u.LogError(err) {
		return
	}
	ctx.ContentType(core.ContentTypeJson)
	ctx.Write(bytes)
}

// GetHashElements Get /api/v1/hash?key={0}
func GetHashElements(ctx iris.Context) {
	key := ctx.FormValue("key")
	if key == "" {
		ctx.WriteString("key is missing in query")
		return
	}

	client := getClient(ctx)
	// if client == nil {
	// 	return
	// }

	v, err := client.HGetAll(key).Result()
	if u.LogError(err) {
		return
	}

	ctx.ContentType(core.ContentTypeJson)
	if len(v) > 0 {
		bytes, err := json.Marshal(v)
		if u.LogError(err) {
			return
		}

		ctx.Write(bytes)
	} else {
		ctx.WriteString("[]")
	}
}

// GetListElements Get /api/v1/list?key={0}
func GetListElements(ctx iris.Context) {
	key := ctx.FormValue("key")
	if key == "" {
		ctx.WriteString("key is missing in query")
		return
	}

	client := getClient(ctx)
	// if client == nil {
	// 	return
	// }

	v, err := client.LRange(key, 0, -1).Result()
	if u.LogError(err) {
		return
	}

	ctx.ContentType(core.ContentTypeJson)
	if len(v) > 0 {
		bytes, err := json.Marshal(v)
		if u.LogError(err) {
			return
		}

		ctx.Write(bytes)
	} else {
		ctx.WriteString("[]")
	}
}

// GetSetElements Get /api/v1/set?key={0}
func GetSetElements(ctx iris.Context) {
	key := ctx.FormValue("key")
	if key == "" {
		ctx.WriteString("key is missing in query")
		return
	}

	client := getClient(ctx)
	// if client == nil {
	// 	return
	// }

	v, err := client.SMembers(key).Result()
	if u.LogError(err) {
		return
	}

	ctx.ContentType(core.ContentTypeJson)
	if len(v) > 0 {
		bytes, err := json.Marshal(v)
		if u.LogError(err) {
			return
		}

		ctx.Write(bytes)
	} else {
		ctx.WriteString("[]")
	}
}

// GetZSetElements Get /api/v1/zset?key={0}
func GetZSetElements(ctx iris.Context) {
	key := ctx.FormValue("key")
	if key == "" {
		ctx.WriteString("key is missing in query")
		return
	}

	client := getClient(ctx)
	// if client == nil {
	// 	return
	// }

	v, err := client.ZRangeByScoreWithScores(key, &redis.ZRangeBy{
		Min: "-inf",
		Max: "+inf",
		// Offset: 0,
		// Count:  2,
	}).Result()
	if u.LogError(err) {
		return
	}

	ctx.ContentType(core.ContentTypeJson)
	if len(v) > 0 {
		bytes, err := json.Marshal(v)
		if u.LogError(err) {
			return
		}

		ctx.Write(bytes)
	} else {
		ctx.WriteString("[]")
	}
}

// SaveEntry Post /api/v1/entry
func SaveEntry(ctx iris.Context) {
	cmd := new(core.SaveRedisEntryCommand)
	ctx.ReadJSON(cmd)

	if cmd.Editing == nil {
		ctx.WriteString("editing entry is missing")
		return
	} else if strings.TrimSpace(cmd.Editing.Key) == "" {
		ctx.WriteString("editing key is missing")
		return
	}

	client := getClient(ctx)

	////////// Save entry by type
	switch cmd.Editing.Type {
	case core.RedisType_String:
		err := saveString(client, cmd)
		u.LogError(err)
		if handleError(ctx, err) {
			return
		}
		break
	case core.RedisType_Hash:
		err := saveHash(client, cmd)
		u.LogError(err)
		if handleError(ctx, err) {
			return
		}
		break
	case core.RedisType_List:
		err := saveList(client, cmd)
		u.LogError(err)
		if handleError(ctx, err) {
			return
		}
		break
	case core.RedisType_Set:
		err := saveSet(client, cmd)
		u.LogError(err)
		if handleError(ctx, err) {
			return
		}
		break
	case core.RedisType_ZSet:
		err := saveZSet(client, cmd)
		u.LogError(err)
		if handleError(ctx, err) {
			return
		}
		break
	default:
		err := fmt.Errorf("type '%s' does not support yet", cmd.Editing.Type)
		u.LogError(err)
		if handleError(ctx, err) {
			return
		}
		break
	}

	////////// save TTL
	err := saveTTL(client, cmd)
	u.LogError(err)
	if handleError(ctx, err) {
		return
	}
}

// DeleteKeys DELETE /api/v1/keys
func DeleteKeys(ctx iris.Context) {
	entries := make([]*core.RedisEntry, 0)
	ctx.ReadJSON(&entries)

	if len(entries) == 0 {
		ctx.WriteString("entries array is missing")
		return
	}

	client := getClient(ctx)
	pipe := client.Pipeline()
	for _, entry := range entries {
		pipe.Del(entry.Key)
	}
	_, err := pipe.Exec()
	u.LogError(err)
	handleError(ctx, err)
}

// DeleteMembers DELETE /api/v1/entries
func DeleteMembers(ctx iris.Context) {
	entries := make([]*core.RedisEntry, 0)
	ctx.ReadJSON(&entries)

	if len(entries) == 0 {
		ctx.WriteString("entries array is missing")
		return
	}

	client := getClient(ctx)
	pipe := client.Pipeline()

	for _, entry := range entries {
		switch entry.Type {
		case core.RedisType_Hash:
			pipe.HDel(entry.Key, entry.Field)
			break
		case core.RedisType_List:
			pipe.LRem(entry.Key, 0, entry.Value)
			break
		case core.RedisType_Set:
			pipe.SRem(entry.Key, entry.Value)
			break
		case core.RedisType_ZSet:
			pipe.ZRem(entry.Key, entry.Value)
			break
		}
	}
	_, err := pipe.Exec()
	u.LogError(err)
	handleError(ctx, err)
}

// Export POST /api/v1/export/keys
func ExportKeys(ctx iris.Context) {
	ctx.ContentType(core.ContentTypeJson)

	var keys []string
	mr := new(core.MsgResult)
	ctx.ReadJSON(&keys)
	if keys == nil || len(keys) == 0 {
		writeMsgResult(ctx, mr, "keys are missing")
		return
	}

	client := getClient(ctx)
	exporter := io.NewExporter(true, client)
	bytes, err := exporter.ExportKeys(keys...)
	u.LogError(err)
	if writeMsgResultError(ctx, mr, err) {
		return
	}
	mr.Data = bytes
	jsonBytes, err := json.Marshal(mr)
	u.LogError(err)
	if writeMsgResultError(ctx, mr, err) {
		return
	}
	ctx.Write(jsonBytes)
}

// Import POST /api/v1/import/keys
func ImportKeys(ctx iris.Context) {
	ctx.ContentType(core.ContentTypeJson)

	var bytes []byte
	ctx.ReadJSON(&bytes)
	mr := new(core.MsgResult)
	if bytes == nil || len(bytes) < 3 {
		writeMsgResult(ctx, mr, "import data missing")
		return
	}

	client := getClient(ctx)
	importer := io.NewImporter(client)
	imported, err := importer.ImportKeys(bytes)
	u.LogError(err)
	if writeMsgResultError(ctx, mr, err) {
		return
	}

	mr.Data = imported
	jsonBytes, err := json.Marshal(mr)
	u.LogError(err)
	if writeMsgResultError(ctx, mr, err) {
		return
	}
	ctx.Write(jsonBytes)
}

// Export POST /api/v1/export/file
func ExportFile(ctx iris.Context) {
	// var keys []string
	// ctx.ReadJSON(&keys)
	keysStr := ctx.FormValue("keys")
	keys := strings.Split(keysStr, ",")
	if keys == nil || len(keys) == 0 {
		ctx.StatusCode(http.StatusBadRequest)
		return
	}
	dbStr := ctx.FormValueDefault("db", "0")
	client := getClient(ctx)
	exporter := io.NewExporter(false, client)
	bytes, err := exporter.ExportZipFile(keys...)
	u.LogError(err)
	if !handleError(ctx, err) {
		ctx.ContentType("application/octet-stream")
		ctx.Header("Content-Disposition", fmt.Sprintf("attachment;filename=%s-%s.rmd", dbStr, time.Now().Format("20060102-150405")))
		ctx.Write(bytes)
	}
}

// Import POST /api/v1/import/file
func ImportFile(ctx iris.Context) {
	file, info, err := ctx.FormFile("file")
	u.LogError(err)
	if handleError(ctx, err) {
		return
	}
	defer file.Close()

	client := getClient(ctx)
	importer := io.NewImporter(client)

	_, err = importer.ImportZipFile(file, info.Size)
	u.LogError(err)
	handleError(ctx, err)
}
