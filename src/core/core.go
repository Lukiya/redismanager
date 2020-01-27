package core

import (
	"log"
	"strconv"
	"strings"

	"github.com/syncfuture/go/sredis"

	"github.com/go-redis/redis/v7"
	"github.com/syncfuture/go/config"
	u "github.com/syncfuture/go/util"
)

const (
	ContentTypeJson       = "application/json"
	ContentTypeJavascript = "application/javascript"
	ContentTypeTextHtml   = "text/html"
)

var (
	ConfigProvider config.IConfigProvider
	RedisConfig    *sredis.RedisConfig
	ClusterClient  *redis.ClusterClient
	DBs            = make(map[int]redis.Cmdable)
	Debug          bool
)

func init() {
	ConfigProvider = config.NewJsonConfigProvider()
	Debug = ConfigProvider.GetBool("Dev.Debug")
	RedisConfig = ConfigProvider.GetRedisConfig()
	if len(RedisConfig.Addrs) == 0 {
		log.Fatal("addrs cannot be empty")
	}

	if len(RedisConfig.Addrs) == 1 {
		// Not a cluster
		options := &redis.Options{
			Addr:     RedisConfig.Addrs[0],
			DB:       0,
			Password: RedisConfig.Password,
		}
		// create db0 client
		DBs[0] = redis.NewClient(options)

		// use db0 clientto get db count
		databases, err := DBs[0].ConfigGet("databases").Result()
		u.LogFaltal(err)
		dbcount, _ := strconv.Atoi(databases[1].(string))
		for i := 1; i < dbcount; i++ {
			// skip first one, create client for rest db
			DBs[i] = redis.NewClient(&redis.Options{
				Addr:     RedisConfig.Addrs[0],
				DB:       i,
				Password: RedisConfig.Password,
			})
		}
	} else {
		// cluster
		c := &redis.ClusterOptions{
			Addrs: RedisConfig.Addrs,
		}
		if RedisConfig.Password != "" {
			c.Password = RedisConfig.Password
		}
		ClusterClient = redis.NewClusterClient(c)
		DBs[0] = ClusterClient
	}
}

func IsJson(str string) bool {
	if str == "" {
		return false
	}

	str = strings.TrimSpace(str)

	return strings.HasPrefix(str, "{") && strings.HasSuffix(str, "}")
}
