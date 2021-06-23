package io

import (
	"archive/zip"
	"context"
	"encoding/json"
	"runtime"
	"sync"

	"github.com/Lukiya/redismanager/src/go/shared"
	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/serr"
	"github.com/syncfuture/go/stask"
	"github.com/syncfuture/go/u"
)

type Exporter struct {
	Zip           bool
	client        redis.UniversalClient
	clusterClient *redis.ClusterClient
	ctx           context.Context
}

func NewExporter(ctx context.Context, zip bool, client redis.UniversalClient, clusterClient *redis.ClusterClient) (r *Exporter) {
	r = new(Exporter)
	r.client = client
	r.clusterClient = clusterClient
	r.Zip = zip
	r.ctx = ctx
	return r
}

func (x *Exporter) ExportKeys(keys ...string) (r []byte, err error) {
	keyCount := len(keys)
	if keyCount == 0 {
		return nil, serr.New("key is missing")
	}

	entries := make([]*ExportFileEntry, 0, keyCount)

	locker := new(sync.Mutex)
	scheduler := stask.NewFlowScheduler(runtime.NumCPU())
	scheduler.SliceRun(&keys, func(_ int, v interface{}) {
		key := v.(string)
		entry, err := x.ExportKey(key)
		if !u.LogError(err) && entry != nil {
			locker.Lock()
			entries = append(entries, entry)
			locker.Unlock()
		}
	})

	// for i := 0; i < keyCount; i++ {
	// 	entry, err := x.ExportKey(keys[i])
	// 	if !u.LogError(err) && entry != nil {
	// 		entries = append(entries, entry)
	// 	}
	// }

	r, err = json.Marshal(entries)
	if err != nil {
		return nil, serr.WithStack(err)
	} else if x.Zip {
		r, err = zipBytes(r)
	}

	var prefix []byte
	if x.Zip {
		prefix = []byte{shared.ZipIndicator1, shared.ZipIndicatorSeperator}
	} else {
		prefix = []byte{shared.ZipIndicator0, shared.ZipIndicatorSeperator}
	}
	r = append(prefix, r...)

	return r, err
}

func (x *Exporter) ExportKey(key string) (r *ExportFileEntry, err error) {
	if key == "" {
		panic("key is missing")
	}

	var client redis.UniversalClient
	if x.clusterClient != nil {
		client, err = x.clusterClient.MasterForKey(x.ctx, key)
	} else {
		client = x.client
	}

	redisType, err := client.Type(x.ctx, key).Result()
	if err != nil {
		return nil, serr.WithStack(err)
	}

	// Export whole key
	switch redisType {
	case shared.RedisType_String:
		v, err := client.Get(x.ctx, key).Result()
		if err != nil {
			return nil, serr.WithStack(err)
		}
		r, err = NewExportFileEntry(key, redisType, v)
		break
	case shared.RedisType_Hash:
		v, err := client.HGetAll(x.ctx, key).Result()
		if err != nil {
			return nil, serr.WithStack(err)
		}
		r, err = NewExportFileEntry(key, redisType, v)
		break
	case shared.RedisType_List:
		v, err := client.LRange(x.ctx, key, 0, -1).Result()
		if err != nil {
			return nil, serr.WithStack(err)
		}
		r, err = NewExportFileEntry(key, redisType, v)
		break
	case shared.RedisType_Set:
		v, err := client.SMembers(x.ctx, key).Result()
		if err != nil {
			return nil, serr.WithStack(err)
		}
		r, err = NewExportFileEntry(key, redisType, v)
		break
	case shared.RedisType_ZSet:
		v, err := client.ZRangeByScoreWithScores(x.ctx, key, &redis.ZRangeBy{
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
// 	case shared.RedisType_Hash:
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
// 	case shared.RedisType_List:
// 		start, end := members[0].(int64), members[1].(int64)
// 		v, err := x.client.LRange(key, start, end).Result()
// 		if err != nil {
// 			return nil, err
// 		}
// 		r, err = NewExportFileEntry(key, redisType, v)
// 		break
// 	case shared.RedisType_Set:
// 		r, err = NewExportFileEntry(key, redisType, members)
// 		break
// 	case shared.RedisType_ZSet:
// 		r, err = NewExportFileEntry(key, redisType, members)
// 		break
// 	}

// 	return r, err
// }
