package rmr

import "sync"

const (
	_clusterDisabedError = "ERR This instance has cluster support disabled"
)

var (
	_wgPool = &sync.Pool{
		New: func() interface{} {
			return new(sync.WaitGroup)
		},
	}
)

type IRedisDB interface {
	ScanKeys(query *ScanQuerySet) (*ScanKeyResult, error)
	ScanMoreKeys(query *ScanQuerySet) (*ScanKeyResult, error)
	GetAllKeys(query *ScanQuerySet) (*ScanKeyResult, error)
	GetKey(key string) (*RedisKey, error)
	ScanElements(query *ScanQuerySet) (*ScanElementResult, error)
	GetAllElements(query *ScanQuerySet) (*ScanElementResult, error)
	KeyExists(key string) (bool, error)
	SaveValue(cmd *SaveRedisEntryCommand) (*RedisEntry, error)
	DeleteKey(key string) error
	DeleteElement(key, element string) error
	GetRedisEntry(key, elementKey string) (*RedisEntry, error)
}

type ServerConfig struct {
	ID       string   `json:"ID,omitempty"`
	Name     string   `json:"Name,omitempty"`
	Addrs    []string `json:"Addrs,omitempty"`
	Password string   `json:"Password,omitempty"`
	Selected bool     `json:"Selected,omitempty"`
}

type ScanQuerySet struct {
	Key     string
	Type    string
	All     bool
	Query   *ScanQuery
	Cursors map[string]uint64
}

type ScanQuery struct {
	Cursor  uint64
	Count   int64
	Keyword string
}

type ScanKeyResult struct {
	Cursors map[string]uint64
	Keys    []*RedisKey
}

type ElementResult struct {
	// Field string
	// Value string
	// Index uint64
	// Score float64
	Key   interface{}
	Value interface{}
}

type ScanElementResult struct {
	Cursor   uint64
	Elements []*ElementResult
}

type SaveRedisEntryCommand struct {
	New   *RedisEntry `json:"new"`
	Old   *RedisEntry `json:"old"`
	IsNew bool        `json:"isNew"`
}
type DeleteRedisEntryCommand struct {
	Key     string
	Element string
}
