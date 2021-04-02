package rmr

import (
	"github.com/go-redis/redis/v7"
)

type RedisDB struct {
	client redis.UniversalClient
	db     int
	// Keys          []string
	// scanKeyCursor int64
}

func NewRedisDB(db int, addr, pwd string) *RedisDB {
	r := &RedisDB{
		db: db,
		client: redis.NewClient(&redis.Options{
			Addr:     addr,
			Password: pwd,
			DB:       db,
		}),
		// scanKeyCursor: -1,
	}
	return r
}
func (x *RedisDB) GetKeys(cursor uint64, match string, count int64) ([]string, uint64, error) {
	return x.client.Scan(cursor, match, count).Result()
}

// func (x *RedisDB) LoadKeys() error {
// 	if x.scanKeyCursor == 0 {
// 		return nil
// 	}

// 	var err error
// 	var ks []string
// 	var cursor uint64

// 	if x.scanKeyCursor >= 0 {
// 		cursor = uint64(x.scanKeyCursor)
// 	} else {
// 		cursor = 0
// 	}
// 	ks, cursor, err = x.GetKeys(cursor, "", 100)
// 	if err != nil {
// 		return err
// 	}
// 	x.scanKeyCursor = int64(cursor)

// 	x.Keys = append(x.Keys, ks...)
// 	return nil
// }

// func (x *RedisDB) LoadAllKeys() error {
// 	var err error
// 	for {
// 		err = x.LoadKeys()
// 		if err != nil {
// 			return err
// 		}
// 		if x.scanKeyCursor == 0 {
// 			break
// 		}
// 	}

// 	return nil
// }

// func (x *RedisDB) TotalKeys() (int64, error) {
// 	return x.client.DBSize().Result()
// }

// func (x *RedisDB) Reset() {
// 	x.scanKeyCursor = -1
// }
