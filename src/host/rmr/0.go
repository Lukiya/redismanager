package rmr

import (
	"github.com/syncfuture/go/sredis"
)

const (
	RedisType_String = "string"
	RedisType_Hash   = "hash"
	RedisType_List   = "list"
	RedisType_Set    = "set"
	RedisType_ZSet   = "zset"
)

type ServerConfig struct {
	ID       string
	Name     string
	Selected bool
	sredis.RedisConfig
}

type EntryQuery struct {
	Cursor uint64
	Count  int64
	Match  string
}

type EntryQueryResult struct {
	Cursor  uint64
	Entries []*RedisKey
}
