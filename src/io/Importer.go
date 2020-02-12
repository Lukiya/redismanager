package io

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/Lukiya/redismanager/src/go/core"

	"github.com/go-redis/redis/v7"
	"github.com/syncfuture/go/task"
	u "github.com/syncfuture/go/util"
)

type Importer struct {
	Zip    bool
	client redis.Cmdable
}

func NewImporter(client redis.Cmdable) (r *Importer) {
	r = new(Importer)
	r.client = client
	return r
}

func (x *Importer) ImportKeys(in []byte) (imported int, err error) {
	if in == nil || len(in) < 3 {
		err = fmt.Errorf("input bytes are missing")
		return
	}
	if in[0] == core.ZipIndicator1 && in[1] == core.ZipIndicatorSeperator { // data is compressed, need to decompress
		in, err = unzipBytes(in[2:]) // remove first 2 byte (zip indicator)
		if u.LogError(err) {
			return
		}
	} else {
		in = in[2:]
	}

	var entries []*ExportFileEntry
	err = json.Unmarshal(in, &entries)
	if u.LogError(err) {
		return
	}

	imported = len(entries)

	scheduler := task.NewFlowScheduler(4)
	scheduler.SliceRun(&entries, func(i int, v interface{}) {
		entry := v.(*ExportFileEntry)

		// Remove old key
		err = x.client.Del(entry.Key).Err()
		if u.LogError(err) {
			return
		}

		// Import new key by type
		switch entry.Type {
		case core.RedisType_String:
			var v string
			err = json.Unmarshal(entry.Data, &v)
			if u.LogError(err) {
				return
			}
			err = x.client.Set(entry.Key, v, time.Duration(-1)).Err()
			u.LogError(err)
			break
		case core.RedisType_Hash:
			var v map[string]interface{}
			err = json.Unmarshal(entry.Data, &v)
			if u.LogError(err) {
				return
			}
			err = x.client.HMSet(entry.Key, v).Err()
			u.LogError(err)
			break
		case core.RedisType_List:
			var v []interface{}
			err = json.Unmarshal(entry.Data, &v)
			if u.LogError(err) {
				return
			}
			err = x.client.RPush(entry.Key, v...).Err()
			u.LogError(err)
			break
		case core.RedisType_Set:
			var v []interface{}
			err = json.Unmarshal(entry.Data, &v)
			if u.LogError(err) {
				return
			}
			err = x.client.SAdd(entry.Key, v...).Err()
			u.LogError(err)
			break
		case core.RedisType_ZSet:
			var v []*redis.Z
			err = json.Unmarshal(entry.Data, &v)
			if u.LogError(err) {
				return
			}
			err = x.client.ZAdd(entry.Key, v...).Err()
			u.LogError(err)
			break
		}
	})

	return
}
