package handlers

import (
	"encoding/json"
	"io/ioutil"
	"strconv"
	"sync"

	"github.com/syncfuture/go/sredis"

	"github.com/go-redis/redis/v7"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/kataras/iris/v12"
	u "github.com/syncfuture/go/util"
)

const (
	_defaultMatch = "*"
)

func getClient(ctx iris.Context) (r redis.Cmdable) {
	if core.ClusterClient == nil {
		dbStr := ctx.FormValueDefault("db", "0")
		db, err := strconv.Atoi(dbStr)
		if u.LogError(err) {
			db = 0
			return nil
		}
		return core.DBs[db]
	} else {
		return core.ClusterClient
	}
}

// GetKeys GET /api/keys
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

// GetDBs GET /api/dbs
func GetDBs(ctx iris.Context) {
	dbCount := len(core.DBs)
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

// // GetDBCount GET /api/db/count
// func GetDBCount(ctx iris.Context) {
// 	dbcount := strconv.Itoa(len(core.DBs))
// 	ctx.WriteString(dbcount)
// }

// GetConfigs Get /api/configs
func GetConfigs(ctx iris.Context) {
	ctx.ContentType(core.ContentTypeJson)
	bytes, err := ioutil.ReadFile("configs.json")
	if err != nil {
		ctx.WriteString(err.Error())
	} else {
		ctx.Write(bytes)
	}
}

// GetValue Get /api/key/value?key={0}&type={1}&field={2}
func GetValue(ctx iris.Context) {
	key := ctx.FormValue("key")
	if key == "" {
		ctx.WriteString("key is missing in query")
		return
	}
	keyType := ctx.FormValue("type")
	if keyType == "" {
		ctx.WriteString("type is missing in query")
		return
	}

	client := getClient(ctx)

	switch keyType {
	case "string":
		v := client.Get(key).Val()
		ctx.WriteString(v)
		return
	case "hash":
		field := ctx.FormValue("field")
		if field == "" {
			ctx.WriteString("field is missing in query")
			return
		}
		v := client.HGet(key, field).Val()
		ctx.WriteString(v)
		return
	}
}
