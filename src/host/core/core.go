package core

import (
	"bytes"
	"log"
	"strconv"
	"strings"
	"sync"

	"github.com/syncfuture/go/sredis"

	"github.com/go-redis/redis/v7"
	config "github.com/syncfuture/go/sconfig"
	"github.com/syncfuture/go/u"
)

const (
	ContentTypeJson       = "application/json"
	ContentTypeJavascript = "application/javascript"
	ContentTypeTextHtml   = "text/html"
	RedisType_String      = "string"
	RedisType_Hash        = "hash"
	RedisType_List        = "list"
	RedisType_Set         = "set"
	RedisType_ZSet        = "zset"
	ZipIndicator0         = 48
	ZipIndicator1         = 49
	ZipIndicatorSeperator = 124
)

var (
	ConfigProvider config.IConfigProvider
	RedisConfig    *sredis.RedisConfig
	ClusterClient  *redis.ClusterClient
	DBClients      = make(map[int]redis.Cmdable)
	Debug          bool
	BufferPool     *sync.Pool
)

func init() {
	ConfigProvider = config.NewJsonConfigProvider()
	Debug = ConfigProvider.GetBool("Dev.Debug")
	ConfigProvider.GetStruct("Redis", &RedisConfig)
	if len(RedisConfig.Addrs) == 0 {
		log.Fatal("addrs cannot be empty")
	}

	if len(RedisConfig.Addrs) == 1 {
		// standalone
		options := &redis.Options{
			Addr:     RedisConfig.Addrs[0],
			DB:       0,
			Password: RedisConfig.Password,
		}
		// create db0 client
		DBClients[0] = redis.NewClient(options)

		// use db0 clientto get db count
		databases, err := DBClients[0].ConfigGet("databases").Result()
		u.LogFaltal(err)
		dbcount, _ := strconv.Atoi(databases[1].(string))
		for i := 1; i < dbcount; i++ {
			// skip first one, create client for rest db
			DBClients[i] = redis.NewClient(&redis.Options{
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
		DBClients[0] = ClusterClient
	}

	BufferPool = &sync.Pool{
		New: func() interface{} {
			var b bytes.Buffer
			return &b
		},
	}
}

func IsJson(str string) bool {
	if str == "" {
		return false
	}

	str = strings.TrimSpace(str)

	return strings.HasPrefix(str, "{") && strings.HasSuffix(str, "}")
}
