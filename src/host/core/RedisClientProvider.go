package core

import (
	"strconv"

	"github.com/go-redis/redis/v7"
	log "github.com/syncfuture/go/slog"
)

type RedisClientProvider struct {
	config        *RedisConfigX
	ClusterClient *redis.ClusterClient
	DBClients     map[int]redis.Cmdable
}

func NewRedisClientProvider(redisConfig *RedisConfigX) (r *RedisClientProvider, err error) {
	r = new(RedisClientProvider)
	r.DBClients = make(map[int]redis.Cmdable)
	r.config = redisConfig

	if len(r.config.Addrs) == 1 {
		// standalone
		options := &redis.Options{
			Addr:     redisConfig.Addrs[0],
			DB:       0,
			Password: redisConfig.Password,
		}
		// create db0 client
		r.DBClients[0] = redis.NewClient(options)

		// use db0 clientto get db count
		databases, err := r.DBClients[0].ConfigGet("databases").Result()
		if err != nil {
			return r, err
		}
		dbcount, _ := strconv.Atoi(databases[1].(string))
		for i := 1; i < dbcount; i++ {
			// skip first one, create client for rest db
			r.DBClients[i] = redis.NewClient(&redis.Options{
				Addr:     redisConfig.Addrs[0],
				DB:       i,
				Password: redisConfig.Password,
			})
		}
	} else if len(r.config.Addrs) > 1 {
		// cluster
		c := &redis.ClusterOptions{
			Addrs: redisConfig.Addrs,
		}
		if redisConfig.Password != "" {
			c.Password = redisConfig.Password
		}
		r.ClusterClient = redis.NewClusterClient(c)
		r.DBClients[0] = r.ClusterClient
	} else {
		log.Fatal("'Redis.Addrs' is missing in configuration")
	}

	return r, nil
}

func (x *RedisClientProvider) GetClient(dbs ...int) (r redis.Cmdable) {
	if x.ClusterClient == nil {
		return x.DBClients[dbs[0]]
	} else {
		return x.ClusterClient
	}
}

// func (x *RedisProxy) ToJsonBytes() []byte {
// 	data, err := json.Marshal(x)
// 	if err != nil {
// 		return nil
// 	}
// 	return data
// }
