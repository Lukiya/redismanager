package rmr

const (
	_clusterDisabedError = "ERR This instance has cluster support disabled"
)

type IRedisDB interface {
	ScanKeys(query *ScanQuerySet) (*ScanKeyResult, error)
	ScanMoreKeys(query *ScanQuerySet) (*ScanKeyResult, error)
	GetAllKeys(query *ScanQuerySet) (*ScanKeyResult, error)
	GetKey(key string) (*RedisKey, error)
	GetElements(query *ScanQuerySet) (*ScanElementResult, error)
	KeyExists(key string) (bool, error)
	SaveValue(cmd *SaveRedisEntryCommand) error
	DeleteKey(key string) error
	DeleteElement(key, element string) error
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
	Field string
	Value string
	Index uint64
	Score float64
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
type RedisEntry struct {
	Key   string
	Type  string
	Field string
	Value string
	TTL   int64
}
