package rmr

import (
	"github.com/syncfuture/go/sconv"
	"github.com/syncfuture/go/serr"
)

type RedisNode struct {
	addr     string
	password string
	DBs      []*RedisDB
}

func NewRedisNode(addr, pwd string) (*RedisNode, error) {
	r := &RedisNode{
		addr:     addr,
		password: pwd,
	}
	err := r.LoadDBs()
	if err != nil {
		return nil, err
	}

	return r, err
}

func (x *RedisNode) LoadDBs() error {
	db0 := NewRedisDB(0, x.addr, x.password)
	x.DBs = append(x.DBs, db0)

	databases, err := db0.client.ConfigGet("databases").Result()
	if err != nil {
		return serr.WithStack(err)
	}
	dbcount := sconv.ToInt(databases[1])

	for i := 1; i < dbcount; i++ { // skip db0 since it's already been added
		db := NewRedisDB(i, x.addr, x.password)
		x.DBs = append(x.DBs, db)
	}

	return nil
}
