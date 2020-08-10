package io

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"errors"

	"github.com/Lukiya/redismanager/src/go/core"

	"github.com/go-redis/redis/v7"
	"github.com/syncfuture/go/u"
)

type Exporter struct {
	Zip    bool
	client redis.Cmdable
}

func NewExporter(zip bool, client redis.Cmdable) (r *Exporter) {
	r = new(Exporter)
	r.client = client
	r.Zip = zip
	return r
}

func (x *Exporter) ExportKeys(keys ...string) (r []byte, err error) {
	keyCount := len(keys)
	if keyCount == 0 {
		err = errors.New("key is missing")
		u.LogError(err)
		return nil, err
	}

	entries := make([]*ExportFileEntry, 0, keyCount)
	for i := 0; i < keyCount; i++ {
		entry, err := x.ExportKey(keys[i])
		if !u.LogError(err) && entry != nil {
			entries = append(entries, entry)
		}
	}

	r, err = json.Marshal(entries)
	if x.Zip {
		r, err = zipBytes(r)
	}
	var prefix []byte
	if x.Zip {
		prefix = []byte{core.ZipIndicator1, core.ZipIndicatorSeperator}
	} else {
		prefix = []byte{core.ZipIndicator0, core.ZipIndicatorSeperator}
	}
	r = append(prefix, r...)

	return r, err
}

func (x *Exporter) ExportKey(key string) (r *ExportFileEntry, err error) {
	if key == "" {
		panic("key is missing")
	}

	redisType, err := x.client.Type(key).Result()
	if u.LogError(err) {
		return nil, err
	}

	// Export whole key
	switch redisType {
	case core.RedisType_String:
		v, err := x.client.Get(key).Result()
		if u.LogError(err) {
			return nil, err
		}
		r, err = NewExportFileEntry(key, redisType, v)
		break
	case core.RedisType_Hash:
		v, err := x.client.HGetAll(key).Result()
		if u.LogError(err) {
			return nil, err
		}
		r, err = NewExportFileEntry(key, redisType, v)
		break
	case core.RedisType_List:
		v, err := x.client.LRange(key, 0, -1).Result()
		if u.LogError(err) {
			return nil, err
		}
		r, err = NewExportFileEntry(key, redisType, v)
		break
	case core.RedisType_Set:
		v, err := x.client.SMembers(key).Result()
		if u.LogError(err) {
			return nil, err
		}
		r, err = NewExportFileEntry(key, redisType, v)
		break
	case core.RedisType_ZSet:
		v, err := x.client.ZRangeByScoreWithScores(key, &redis.ZRangeBy{
			Min: "-inf",
			Max: "+inf",
		}).Result()
		if u.LogError(err) {
			return nil, err
		}
		r, err = NewExportFileEntry(key, redisType, v)
		break
	}

	return r, err
}

func (x *Exporter) ExportZipFile(keys ...string) (r []byte, err error) {
	var data []byte
	data, err = x.ExportKeys(keys...)
	if u.LogError(err) {
		return
	}

	buf := new(bytes.Buffer)
	w := zip.NewWriter(buf)

	f, err := w.Create("compressed")
	if u.LogError(err) {
		return
	}

	_, err = f.Write(data)
	if u.LogError(err) {
		return
	}

	err = w.Close()
	if u.LogError(err) {
		return
	}

	r = buf.Bytes()
	return
}

// func (x *Exporter) ExportMembers(key string, members ...interface{}) (r *ExportFileEntry, err error) {
// 	if key == "" {
// 		err = errors.New("key is missing")
// 		u.LogError(err)
// 		return nil, err
// 	}
// 	memberCount := len(members)
// 	if memberCount == 0 {
// 		err = errors.New("members are missing")
// 		u.LogError(err)
// 		return nil, err
// 	}

// 	redisType, err := x.client.Type(key).Result()
// 	if u.LogError(err) {
// 		return nil, err
// 	}

// 	// Export
// 	switch redisType {
// 	case core.RedisType_Hash:
// 		f := make([]string, memberCount)
// 		for i := 0; i < memberCount; i++ {
// 			f[i] = members[i].(string)
// 		}
// 		v, err := x.client.HMGet(key, f...).Result()
// 		if u.LogError(err) {
// 			return nil, err
// 		}
// 		r, err = NewExportFileEntry(key, redisType, v)
// 		break
// 	case core.RedisType_List:
// 		start, end := members[0].(int64), members[1].(int64)
// 		v, err := x.client.LRange(key, start, end).Result()
// 		if u.LogError(err) {
// 			return nil, err
// 		}
// 		r, err = NewExportFileEntry(key, redisType, v)
// 		break
// 	case core.RedisType_Set:
// 		r, err = NewExportFileEntry(key, redisType, members)
// 		break
// 	case core.RedisType_ZSet:
// 		r, err = NewExportFileEntry(key, redisType, members)
// 		break
// 	}

// 	return r, err
// }
