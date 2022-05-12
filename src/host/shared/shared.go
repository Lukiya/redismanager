package shared

import "errors"

const (
	ContentTypeJson       = "application/json"
	ContentTypeJavascript = "application/javascript"
	ContentTypeTextHtml   = "text/html"
	RedisType_String      = "string"
	RedisType_Hash        = "hash"
	RedisType_List        = "list"
	RedisType_Set         = "set"
	RedisType_ZSet        = "zset"
	ZipIndicator0         = 48
	ZipIndicator1         = 49
	ZipIndicatorSeperator = 124
)

var (
	KeyExistsError           = errors.New("key already exists")
	HashFieldExistsError     = errors.New("hash filed already exists")
	KeyEmptyError            = errors.New("key cannot be empty")
	FieldEmptyError          = errors.New("field cannot be empty")
	ConnectServerFailedError = errors.New("connect to server failed")
)
