package common

import "errors"

const (
	Version               = "v2.0.0"
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
	KeyExistError = errors.New("key already exists")
)
