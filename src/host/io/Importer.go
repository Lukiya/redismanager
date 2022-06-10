package io

import (
	"archive/zip"
	"context"
	"encoding/json"
	"io"
	"runtime"
	"time"

	"github.com/Lukiya/redismanager/src/go/shared"
	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/serr"
	task "github.com/syncfuture/go/stask"
)

type Importer struct {
	Zip           bool
	client        redis.UniversalClient
	clusterClient *redis.ClusterClient
	ctx           context.Context
}

func NewImporter(ctx context.Context, client redis.UniversalClient, clusterClient *redis.ClusterClient) (r *Importer) {
	r = new(Importer)
	r.client = client
	r.clusterClient = clusterClient
	r.ctx = ctx
	return r
}
func (x *Importer) ImportZipFile(file io.ReaderAt, size int64) (imported int, err error) {
	zipFile, err := zip.NewReader(file, size)
	if err != nil {
		err = serr.WithStack(err)
		return
	}

	buf := _buffPool.GetBuffer()
	defer func() { _buffPool.PutBuffer(buf) }()
	zipEntry1Reader, err := zipFile.File[0].Open()
	if err != nil {
		err = serr.WithStack(err)
		return
	}
	defer func() { zipEntry1Reader.Close() }()

	_, err = io.Copy(buf, zipEntry1Reader)
	if err != nil {
		err = serr.WithStack(err)
		return
	}

	bytes := buf.Bytes()

	return x.ImportKeys(bytes)
}

func (x *Importer) ImportKeys(in []byte) (imported int, err error) {
	if in == nil || len(in) < 3 {
		err = serr.New("input bytes are missing")
		return
	}
	if in[0] == shared.ZipIndicator1 && in[1] == shared.ZipIndicatorSeperator {
		// data is compressed, need to decompress
		in, err = unzipBytes(in[2:]) // remove first 2 byte (zip indicator)
		if err != nil {
			err = serr.WithStack(err)
			return
		}
	} else {
		// data is not compressed
		in = in[2:] // remove first 2 byte (zip indicator)
	}

	var entries []*ExportFileEntry
	err = json.Unmarshal(in, &entries)
	if err != nil {
		err = serr.WithStack(err)
		return
	}

	imported = len(entries)

	scheduler := task.NewFlowScheduler(runtime.NumCPU())
	scheduler.SliceRun(&entries, func(i int, v interface{}) {
		entry := v.(*ExportFileEntry)

		var client redis.UniversalClient
		if x.clusterClient != nil {
			client, err = x.clusterClient.MasterForKey(x.ctx, entry.Key)
		} else {
			client = x.client
		}

		// Remove old key
		err = client.Del(x.ctx, entry.Key).Err()
		if err != nil {
			err = serr.WithStack(err)
			return
		}

		// Import new key by type
		switch entry.Type {
		case shared.RedisType_String:
			var v string
			err = json.Unmarshal(entry.Data, &v)
			if err != nil {
				err = serr.WithStack(err)
				return
			}
			err = client.Set(x.ctx, entry.Key, v, time.Duration(0)).Err()
			if err != nil {
				err = serr.WithStack(err)
				return
			}
			break
		case shared.RedisType_Hash:
			var v map[string]interface{}
			err = json.Unmarshal(entry.Data, &v)
			if err != nil {
				err = serr.WithStack(err)
				return
			}
			err = client.HMSet(x.ctx, entry.Key, v).Err()
			if err != nil {
				err = serr.WithStack(err)
				return
			}
			break
		case shared.RedisType_List:
			var v []interface{}
			err = json.Unmarshal(entry.Data, &v)
			if err != nil {
				err = serr.WithStack(err)
				return
			}
			err = client.RPush(x.ctx, entry.Key, v...).Err()
			if err != nil {
				err = serr.WithStack(err)
				return
			}
			break
		case shared.RedisType_Set:
			var v []interface{}
			err = json.Unmarshal(entry.Data, &v)
			if err != nil {
				err = serr.WithStack(err)
				return
			}
			err = client.SAdd(x.ctx, entry.Key, v...).Err()
			if err != nil {
				err = serr.WithStack(err)
				return
			}
			break
		case shared.RedisType_ZSet:
			var v []*redis.Z
			err = json.Unmarshal(entry.Data, &v)
			if err != nil {
				err = serr.WithStack(err)
				return
			}
			err = client.ZAdd(x.ctx, entry.Key, v...).Err()
			if err != nil {
				err = serr.WithStack(err)
				return
			}
			break
		}
	})

	return
}
