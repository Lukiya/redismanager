package io

import (
	"archive/zip"
	"context"
	"encoding/json"

	"github.com/Lukiya/redismanager/src/go/common"
	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/serr"
	"github.com/syncfuture/go/u"
)

type Exporter struct {
	Zip    bool
	client redis.UniversalClient
}

func NewExporter(zip bool, client redis.UniversalClient) (r *Exporter) {
	r = new(Exporter)
	r.client = client
	r.Zip = zip
	return r
}

func (x *Exporter) ExportKeys(keys ...string) (r []byte, err error) {
	keyCount := len(keys)
	if keyCount == 0 {
		return nil, serr.New("key is missing")
	}

	entries := make([]*ExportFileEntry, 0, keyCount)
	for i := 0; i < keyCount; i++ {
		entry, err := x.ExportKey(keys[i])
		if !u.LogError(err) && entry != nil {
			entries = append(entries, entry)
		}
	}

	r, err = json.Marshal(entries)
	if err != nil {
		return nil, serr.WithStack(err)
	} else if x.Zip {
		r, err = zipBytes(r)
	}

	var prefix []byte
	if x.Zip {
		prefix = []byte{common.ZipIndicator1, common.ZipIndicatorSeperator}
	} else {
		prefix = []byte{common.ZipIndicator0, common.ZipIndicatorSeperator}
	}
	r = append(prefix, r...)

	return r, err
}

func (x *Exporter) ExportKey(key string) (r *ExportFileEntry, err error) {
	if key == "" {
		panic("key is missing")
	}

	ctx := context.Background()

	redisType, err := x.client.Type(ctx, key).Result()
	if err != nil {
		return nil, serr.WithStack(err)
	}

	// Export whole key
	switch redisType {
	case common.RedisType_String:
		v, err := x.client.Get(ctx, key).Result()
		if err != nil {
			return nil, serr.WithStack(err)
		}
		r, err = NewExportFileEntry(key, redisType, v)
		break
	case common.RedisType_Hash:
		v, err := x.client.HGetAll(ctx, key).Result()
		if err != nil {
			return nil, serr.WithStack(err)
		}
		r, err = NewExportFileEntry(key, redisType, v)
		break
	case common.RedisType_List:
		v, err := x.client.LRange(ctx, key, 0, -1).Result()
		if err != nil {
			return nil, serr.WithStack(err)
		}
		r, err = NewExportFileEntry(key, redisType, v)
		break
	case common.RedisType_Set:
		v, err := x.client.SMembers(ctx, key).Result()
		if err != nil {
			return nil, serr.WithStack(err)
		}
		r, err = NewExportFileEntry(key, redisType, v)
		break
	case common.RedisType_ZSet:
		v, err := x.client.ZRangeByScoreWithScores(ctx, key, &redis.ZRangeBy{
			Min: "-inf",
			Max: "+inf",
		}).Result()
		if err != nil {
			return nil, serr.WithStack(err)
		}
		r, err = NewExportFileEntry(key, redisType, v)
		break
	}

	return r, err
}

func (x *Exporter) ExportZipFile(keys ...string) (r []byte, err error) {
	var data []byte
	data, err = x.ExportKeys(keys...)
	if err != nil {
		return nil, serr.WithStack(err)
	}

	buf := _buffPool.GetBuffer()
	w := zip.NewWriter(buf)
	defer func() {
		w.Close()
		_buffPool.PutBuffer(buf)
	}()

	f, err := w.Create("compressed")
	if err != nil {
		return nil, serr.WithStack(err)
	}

	_, err = f.Write(data)
	if err != nil {
		return nil, serr.WithStack(err)
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
// 	if err != nil {
// 		return nil, err
// 	}

// 	// Export
// 	switch redisType {
// 	case common.RedisType_Hash:
// 		f := make([]string, memberCount)
// 		for i := 0; i < memberCount; i++ {
// 			f[i] = members[i].(string)
// 		}
// 		v, err := x.client.HMGet(key, f...).Result()
// 		if err != nil {
// 			return nil, err
// 		}
// 		r, err = NewExportFileEntry(key, redisType, v)
// 		break
// 	case common.RedisType_List:
// 		start, end := members[0].(int64), members[1].(int64)
// 		v, err := x.client.LRange(key, start, end).Result()
// 		if err != nil {
// 			return nil, err
// 		}
// 		r, err = NewExportFileEntry(key, redisType, v)
// 		break
// 	case common.RedisType_Set:
// 		r, err = NewExportFileEntry(key, redisType, members)
// 		break
// 	case common.RedisType_ZSet:
// 		r, err = NewExportFileEntry(key, redisType, members)
// 		break
// 	}

// 	return r, err
// }
