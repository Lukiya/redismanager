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
	GetDB() int
	ScanKeys(query *ScanQuerySet) (*ScanKeyResult, error)
	ScanMoreKeys(query *ScanQuerySet) (*ScanKeyResult, error)
	GetAllKeys(query *ScanQuerySet) (*ScanKeyResult, error)
	GetKey(key string) (*RedisKey, error)
	ScanElements(query *ScanQuerySet) (*ScanElementResult, error)
	GetAllElements(query *ScanQuerySet) (*ScanElementResult, error)
	KeyExists(key string) (bool, error)
	SaveEntry(cmd *SaveRedisEntryCommand) error
	DeleteEntries(cmd *DeleteRedisEntriesCommand) error
	// DeleteKey(key string) error
	// DeleteElement(key, element string) error
	GetRedisEntry(key, elementKey string) (*RedisEntry, error)
	ExportKeys(keys ...string) ([]byte, error)
	ImportKeys(data []byte) (int, error)
}

type TLSCert struct {
	Cert   string `json:"Cert,omitempty"`
	Key    string `json:"Key,omitempty"`
	CACert string `json:"CACert,omitempty"`
}

type ServerConfig struct {
	ID       string   `json:"ID,omitempty"`
	Name     string   `json:"Name,omitempty"`
	Addrs    []string `json:"Addrs,omitempty"`
	Username string   `json:"Username,omitempty"`
	Password string   `json:"Password,omitempty"`
	Selected bool     `json:"Selected,omitempty"`
	TLS      *TLSCert `json:"TLS,omitempty"`
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
	Key        string
	ElementKey string
}

type DeleteRedisEntriesCommand struct {
	Commands []*DeleteRedisEntryCommand
}

type MsgResult struct {
	MsgCode string
	Data    interface{}
}
