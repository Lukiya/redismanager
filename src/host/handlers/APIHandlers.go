package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/syncfuture/go/serr"
	"github.com/syncfuture/go/sredis"
	"github.com/syncfuture/host"

	"github.com/go-redis/redis/v7"

	"github.com/Lukiya/redismanager/src/go/core"
	rmio "github.com/Lukiya/redismanager/src/go/io"
	"github.com/syncfuture/go/u"
)

const (
	_defaultMatch = "*"
)

// GetKeys GET /api/v1/keys
func GetKeys(ctx host.IHttpContext) {
	// match := ctx.FormValueDefault("match", _defaultMatch)
	match := ctx.GetFormString("match")
	if match == "" {
		match = _defaultMatch
	}
	entries := make([]*core.RedisEntry, 0)
	proxy := core.Manager.GetSelectedClientProvider()
	if proxy.ClusterClient != nil {
		mtx := new(sync.Mutex)
		proxy.ClusterClient.ForEachMaster(func(client *redis.Client) error {
			mtx.Lock() // ForEachMaster is running asynchronously, has to lock
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
		nodeKeys := sredis.GetAllKeys(client, match, 100)
		for _, key := range nodeKeys {
			keyEntry := core.NewRedisEntry(client, key)
			entries = append(entries, keyEntry)
		}
	}

	bytes, err := json.Marshal(entries)
	if host.HandleErr(err, ctx) {
		return
	}

	ctx.SetContentType(core.ContentTypeJson)
	ctx.Write(bytes)
}

// GetDBs GET /api/v1/dbs
func GetDBs(ctx host.IHttpContext) {
	clientProvider := core.Manager.GetSelectedClientProvider()
	if clientProvider != nil {
		dbCount := len(clientProvider.DBClients)
		dbs := make([]int, dbCount)
		for i := 0; i < dbCount; i++ {
			dbs[i] = i
		}

		bytes, err := json.Marshal(dbs)
		if host.HandleErr(err, ctx) {
			return
		}
		ctx.SetContentType(core.ContentTypeJson)
		ctx.Write(bytes)
		return
	}

	a, _ := json.Marshal([]int{})
	ctx.SetContentType(core.ContentTypeJson)
	ctx.Write(a)
}

// GetConfigs Get /api/v1/configs
func GetConfigs(ctx host.IHttpContext) {
	ctx.SetContentType(core.ContentTypeJson)
	bytes, err := os.ReadFile("configs.json")
	if err != nil {
		ctx.WriteString(err.Error())
	} else {
		ctx.Write(bytes)
	}
}

// GetEntry Get /api/v1/entry?key={0}&field={1}
func GetEntry(ctx host.IHttpContext) {
	key := ctx.GetFormString("key")
	if key == "" {
		ctx.WriteString("key is missing in query")
		return
	}
	field := ctx.GetFormString("field")

	client := getClient(ctx)
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

// GetHashElements Get /api/v1/hash?key={0}
func GetHashElements(ctx host.IHttpContext) {
	key := ctx.GetFormString("key")
	if key == "" {
		ctx.WriteString("key is missing in query")
		return
	}

	client := getClient(ctx)
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

// GetListElements Get /api/v1/list?key={0}
func GetListElements(ctx host.IHttpContext) {
	key := ctx.GetFormString("key")
	if key == "" {
		ctx.WriteString("key is missing in query")
		return
	}

	client := getClient(ctx)
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

// GetSetElements Get /api/v1/set?key={0}
func GetSetElements(ctx host.IHttpContext) {
	key := ctx.GetFormString("key")
	if key == "" {
		ctx.WriteString("key is missing in query")
		return
	}

	client := getClient(ctx)
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

// GetZSetElements Get /api/v1/zset?key={0}
func GetZSetElements(ctx host.IHttpContext) {
	key := ctx.GetFormString("key")
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

// SaveEntry Post /api/v1/entry
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

	client := getClient(ctx)

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

// DeleteKeys DELETE /api/v1/keys
func DeleteKeys(ctx host.IHttpContext) {
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
	host.HandleErr(err, ctx)
}

// DeleteMembers DELETE /api/v1/entries
func DeleteMembers(ctx host.IHttpContext) {
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
	host.HandleErr(err, ctx)
}

// Export POST /api/v1/export/keys
func ExportKeys(ctx host.IHttpContext) {
	ctx.SetContentType(core.ContentTypeJson)

	var keys []string
	mr := new(core.MsgResult)
	ctx.ReadJSON(&keys)
	if keys == nil || len(keys) == 0 {
		host.HandleErr(serr.New("keys are missing"), ctx)
		return
	}

	client := getClient(ctx)
	exporter := rmio.NewExporter(true, client)
	bytes, err := exporter.ExportKeys(keys...)
	if host.HandleErr(err, ctx) {
		return
	}
	mr.Data = bytes
	jsonBytes, err := json.Marshal(mr)
	if host.HandleErr(err, ctx) {
		return
	}
	ctx.Write(jsonBytes)
}

// Import POST /api/v1/import/keys
func ImportKeys(ctx host.IHttpContext) {
	ctx.SetContentType(core.ContentTypeJson)

	var bytes []byte
	ctx.ReadJSON(&bytes)
	mr := new(core.MsgResult)
	if bytes == nil || len(bytes) < 3 {
		host.HandleErr(serr.New("import data missing"), ctx)
		return
	}

	client := getClient(ctx)
	importer := rmio.NewImporter(client)
	imported, err := importer.ImportKeys(bytes)
	if host.HandleErr(err, ctx) {
		return
	}

	mr.Data = imported
	jsonBytes, err := json.Marshal(mr)
	u.LogError(err)
	if host.HandleErr(err, ctx) {
		return
	}
	ctx.Write(jsonBytes)
}

// Export POST /api/v1/export/file
func ExportFile(ctx host.IHttpContext) {
	// var keys []string
	// ctx.ReadJSON(&keys)
	keysStr := ctx.GetFormString("keys")
	keys := strings.Split(keysStr, ",")
	if keys == nil || len(keys) == 0 {
		ctx.SetStatusCode(http.StatusBadRequest)
		return
	}
	dbStr := ctx.GetFormString("db")
	if dbStr == "" {
		dbStr = "0"
	}
	client := getClient(ctx)
	exporter := rmio.NewExporter(false, client)
	bytes, err := exporter.ExportZipFile(keys...)
	u.LogError(err)
	if !host.HandleErr(err, ctx) {
		ctx.SetContentType("application/octet-stream")
		ctx.SetHeader("Content-Disposition", fmt.Sprintf("attachment;filename=%s-%s.rmd", dbStr, time.Now().Format("20060102-150405")))
		ctx.Write(bytes)
	}
}

// Import POST /api/v1/import/file
func ImportFile(ctx host.IHttpContext) {
	fileHeader, err := ctx.GetFormFile("file")
	if host.HandleErr(err, ctx) {
		return
	}
	file, err := fileHeader.Open()
	defer func() {
		file.Close()
	}()

	client := getClient(ctx)
	importer := rmio.NewImporter(client)

	_, err = importer.ImportZipFile(file, fileHeader.Size)
	u.LogError(err)
	host.HandleErr(err, ctx)
}

// SelectServer POST /api/v1/server
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

// GetServers Get /api/v1/servers
func GetServers(ctx host.IHttpContext) {
	data, err := json.Marshal(core.Manager.Servers)
	if host.HandleErr(err, ctx) {
		return
	}

	ctx.Write(data)
}

// // AddServer Post /api/v1/servers
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

// SelectServer Post /api/v1/servers/{id}
func SelectServer(ctx host.IHttpContext) {
	id := ctx.GetParamString("id")
	if id == "" {
		host.HandleErr(serr.New("id is required"), ctx)
		return
	}

	err := core.Manager.Select(id)
	host.HandleErr(err, ctx)
}

// RemoveServer Delete /api/v1/servers/{id}
func RemoveServer(ctx host.IHttpContext) {
	id := ctx.GetParamString("id")
	if id == "" {
		host.HandleErr(serr.New("id is required"), ctx)
		return
	}

	err := core.Manager.Remove(id)
	host.HandleErr(err, ctx)
}
