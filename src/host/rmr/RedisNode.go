package rmr

import (
	"github.com/syncfuture/go/sconv"
	"github.com/syncfuture/go/serr"
)

type RedisNode struct {
	addr     string
	password string
}

func NewRedisNode(addr, pwd string) *RedisNode {
	r := &RedisNode{
		addr:     addr,
		password: pwd,
	}

	return r
}

func (x *RedisNode) GetDBs() ([]*RedisDB, error) {
	db0 := NewRedisDB(0, x.addr, x.password)
	var dbs []*RedisDB
	dbs = append(dbs, db0)

	databases, err := db0.client.ConfigGet("databases").Result()
	if err != nil {
		return nil, serr.WithStack(err)
	}
	dbcount := sconv.ToInt(databases[1])

	for i := 1; i < dbcount; i++ { // skip db0 since it's already been added
		db := NewRedisDB(i, x.addr, x.password)
		dbs = append(dbs, db)
	}

	return dbs, nil
}
