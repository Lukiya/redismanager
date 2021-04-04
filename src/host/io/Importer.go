package io

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/json"
	"io"
	"time"

	"github.com/Lukiya/redismanager/src/go/core"

	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/serr"
	task "github.com/syncfuture/go/stask"
	"github.com/syncfuture/go/u"
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
func (x *Importer) ImportZipFile(file io.ReaderAt, size int64) (imported int, err error) {
	zipFile, err := zip.NewReader(file, size)
	if err != nil {
		return
	}

	buf := make([]byte, 0, 1024)
	bytesReader := bytes.NewBuffer(buf)
	zipEntry1Reader, err := zipFile.File[0].Open()
	defer zipEntry1Reader.Close()

	io.Copy(bytesReader, zipEntry1Reader)

	bytes := bytesReader.Bytes()

	return x.ImportKeys(bytes)
}

func (x *Importer) ImportKeys(in []byte) (imported int, err error) {
	if in == nil || len(in) < 3 {
		err = serr.Errorf("input bytes are missing")
		return
	}
	if in[0] == core.ZipIndicator1 && in[1] == core.ZipIndicatorSeperator {
		// data is compressed, need to decompress
		in, err = unzipBytes(in[2:]) // remove first 2 byte (zip indicator)
		if err != nil {
			return
		}
	} else {
		// data is not compressed
		in = in[2:] // remove first 2 byte (zip indicator)
	}

	var entries []*ExportFileEntry
	err = json.Unmarshal(in, &entries)
	if err != nil {
		return
	}

	ctx := context.Background()
	imported = len(entries)

	scheduler := task.NewFlowScheduler(4)
	scheduler.SliceRun(&entries, func(i int, v interface{}) {
		entry := v.(*ExportFileEntry)

		// Remove old key
		err = x.client.Del(ctx, entry.Key).Err()
		if err != nil {
			return
		}

		// Import new key by type
		switch entry.Type {
		case core.RedisType_String:
			var v string
			err = json.Unmarshal(entry.Data, &v)
			if err != nil {
				return
			}
			err = x.client.Set(ctx, entry.Key, v, time.Duration(-1)).Err()
			u.LogError(err)
			break
		case core.RedisType_Hash:
			var v map[string]interface{}
			err = json.Unmarshal(entry.Data, &v)
			if err != nil {
				return
			}
			err = x.client.HMSet(ctx, entry.Key, v).Err()
			u.LogError(err)
			break
		case core.RedisType_List:
			var v []interface{}
			err = json.Unmarshal(entry.Data, &v)
			if err != nil {
				return
			}
			err = x.client.RPush(ctx, entry.Key, v...).Err()
			u.LogError(err)
			break
		case core.RedisType_Set:
			var v []interface{}
			err = json.Unmarshal(entry.Data, &v)
			if err != nil {
				return
			}
			err = x.client.SAdd(ctx, entry.Key, v...).Err()
			u.LogError(err)
			break
		case core.RedisType_ZSet:
			var v []*redis.Z
			err = json.Unmarshal(entry.Data, &v)
			if err != nil {
				return
			}
			err = x.client.ZAdd(ctx, entry.Key, v...).Err()
			u.LogError(err)
			break
		}
	})

	return
}
