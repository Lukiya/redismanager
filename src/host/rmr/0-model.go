package rmr

const (
	_clusterDisabedError = "ERR This instance has cluster support disabled"
)

type IRedisDB interface {
	ScanKeys(query *ScanQuery) (map[string]*KeyQueryResult, error)
	ScanMoreKeys(queries map[string]*ScanQuery) (map[string]*KeyQueryResult, error)
	GetAllKeys(query *ScanQuery) ([]*RedisKey, error)
	GetKey(key string) (*RedisKey, error)
	GetElements(query *ScanQuerySet) (*ElementQueryResult, error)
	KeyExists(key string) (bool, error)
	SaveValue(cmd *SaveRedisEntryCommand) error
	DeleteKey(key string) error
	DeleteElement(key, typ, element string) error
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
	Query   *ScanQuery
	Queries map[string]*ScanQuery
}

type ScanQuery struct {
	Cursor  uint64
	Count   int64
	Keyword string
}

type KeyQueryResult struct {
	Cursor uint64
	Keys   []*RedisKey
}

type ElementResult struct {
	Field string
	Value string
	Index uint64
	Score float64
}

type ElementQueryResult struct {
	Cursor   uint64
	Elements []*ElementResult
}

type SaveRedisEntryCommand struct {
	New   *RedisEntry `json:"new"`
	Old   *RedisEntry `json:"old"`
	IsNew bool        `json:"isNew"`
}
type RedisEntry struct {
	Key   string
	Type  string
	Field string
	Value string
	TTL   int64
}
