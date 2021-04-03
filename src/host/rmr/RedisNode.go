package rmr

import (
	"strings"

	"github.com/syncfuture/go/sconv"
	"github.com/syncfuture/go/serr"
	"github.com/syncfuture/host"
)

type RedisNode struct {
	ID       string
	Addr     string
	password string
	DBs      map[int]*RedisDB
}

func NewRedisNode(addr, pwd string) *RedisNode {
	r := &RedisNode{
		ID:       host.GenerateID(),
		Addr:     strings.ToLower(strings.TrimSpace(addr)),
		password: pwd,
	}

	return r
}

func (x *RedisNode) LoadDBs() error {
	var err error
	x.DBs, err = x.GetDBs()
	return err
}

func (x *RedisNode) GetDBs() (map[int]*RedisDB, error) {
	db0 := NewRedisDB(0, x.Addr, x.password)
	dbs := make(map[int]*RedisDB)
	// dbs = append(dbs, db0)
	dbs[0] = db0

	databases, err := db0.client.ConfigGet("databases").Result()
	if err != nil {
		return nil, serr.WithStack(err)
	}
	dbcount := sconv.ToInt(databases[1])

	for i := 1; i < dbcount; i++ { // skip db0 since it's already been added
		// dbs = append(dbs, db)
		dbs[i] = NewRedisDB(i, x.Addr, x.password)
	}

	return dbs, nil
}
