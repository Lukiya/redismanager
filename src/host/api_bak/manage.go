package apibak

import (
	"encoding/json"
	"os"
	"sync"

	"github.com/syncfuture/go/sredis"
	"github.com/syncfuture/host"

	"github.com/go-redis/redis/v7"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/Lukiya/redismanager/src/go/helpers"
	"github.com/syncfuture/go/u"
)

const (
	_defaultMatch = "*"
)

// GetKeys GET /api/keys
func GetKeys(ctx host.IHttpContext) {
	match := ctx.GetFormStringDefault("match", _defaultMatch)
	entries := make([]*core.RedisEntry, 0)
	proxy := core.Manager.GetSelectedClientProvider()
	if proxy.ClusterClient != nil {
		mtx := new(sync.Mutex)
		proxy.ClusterClient.ForEachMaster(func(client *redis.Client) error {
			mtx.Lock() // ForEachMaster is running asynchronously, has to lock
			defer func() { mtx.Unlock() }()

			nodeKeys := sredis.GetAllKeys(client, match, 100)
			for _, key := range nodeKeys {
				keyEntry := core.NewRedisEntry(client, key)
				entries = append(entries, keyEntry)
			}

			return nil
		})
	} else {
		client := helpers.GetClient(ctx)
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

// GetDBs GET /api/dbs
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

// GetConfigs Get /api/configs
func GetConfigs(ctx host.IHttpContext) {
	ctx.SetContentType(core.ContentTypeJson)
	bytes, err := os.ReadFile("configs.json")
	if err != nil {
		ctx.WriteString(err.Error())
	} else {
		ctx.Write(bytes)
	}
}

// DeleteKeys DELETE /api/keys
func DeleteKeys(ctx host.IHttpContext) {
	entries := make([]*core.RedisEntry, 0)
	ctx.ReadJSON(&entries)

	if len(entries) == 0 {
		ctx.WriteString("entries array is missing")
		return
	}

	client := helpers.GetClient(ctx)
	pipe := client.Pipeline()
	for _, entry := range entries {
		pipe.Del(entry.Key)
	}
	_, err := pipe.Exec()
	u.LogError(err)
	host.HandleErr(err, ctx)
}

// DeleteMembers DELETE /api/entries
func DeleteMembers(ctx host.IHttpContext) {
	entries := make([]*core.RedisEntry, 0)
	ctx.ReadJSON(&entries)

	if len(entries) == 0 {
		ctx.WriteString("entries array is missing")
		return
	}

	client := helpers.GetClient(ctx)
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
