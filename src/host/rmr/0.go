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

type ClusterConfig struct {
	ID       string
	Name     string
	Selected bool
	sredis.RedisConfig
}

type KeysQuery struct {
	Cursor   uint64
	PageSize int64
	Match    string
}

type KeysQueryResult struct {
	Cursor  uint64
	Entries []*RedisEntry
}
