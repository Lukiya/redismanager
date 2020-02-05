package io

import (
	"encoding/json"
	"time"

	"github.com/Lukiya/redismanager/src/go/core"

	"github.com/go-redis/redis/v7"
	"github.com/syncfuture/go/sredis"
	"github.com/syncfuture/go/task"
	u "github.com/syncfuture/go/util"
)

type Importer struct {
	Zip    bool
	client redis.Cmdable
}

func NewImporter(zip bool, redisConfig *sredis.RedisConfig) (r *Importer) {
	r = new(Importer)
	r.client = sredis.NewClient(redisConfig)
	r.Zip = zip
	return r
}

func (x *Importer) ImportKeys(in []byte) (err error) {
	if x.Zip {
		in, err = unzip(in)
		if u.LogError(err) {
			return err
		}
	}

	var entries []*ExportFileEntry
	err = json.Unmarshal(in, &entries)
	if u.LogError(err) {
		return err
	}

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

	return err
}
