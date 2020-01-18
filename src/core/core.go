package core

import (
	"log"
	"strconv"

	"github.com/syncfuture/go/sredis"

	"github.com/go-redis/redis/v7"
	"github.com/syncfuture/go/config"
)

const (
	ContentTypeJson       = "application/json"
	ContentTypeJavascript = "application/javascript"
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
		// 非集群
		options := &redis.Options{
			Addr:     RedisConfig.Addrs[0],
			DB:       0,
			Password: RedisConfig.Password,
		}
		// 创建db0的Client
		DBs[0] = redis.NewClient(options)

		// 使用db0的client获取总db数
		dbcount, _ := strconv.Atoi(DBs[0].ConfigGet("databases").Val()[1].(string))
		for i := 1; i < dbcount; i++ {
			// 从第二个开始，循环创建每个db的client
			DBs[i] = redis.NewClient(&redis.Options{
				Addr:     RedisConfig.Addrs[0],
				DB:       i,
				Password: RedisConfig.Password,
			})
		}
	} else {
		// 集群
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
