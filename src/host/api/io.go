package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/syncfuture/go/serr"
	"github.com/syncfuture/host"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/Lukiya/redismanager/src/go/helpers"
	"github.com/Lukiya/redismanager/src/go/io"
	"github.com/syncfuture/go/u"
)

// Export POST /api/export/keys
func ExportKeys(ctx host.IHttpContext) {
	ctx.SetContentType(core.ContentTypeJson)

	var keys []string
	mr := new(core.MsgResult)
	ctx.ReadJSON(&keys)
	if keys == nil || len(keys) == 0 {
		host.HandleErr(serr.New("keys are missing"), ctx)
		return
	}

	client := helpers.GetClient(ctx)
	exporter := io.NewExporter(true, client)
	bytes, err := exporter.ExportKeys(keys...)
	if host.HandleErr(err, ctx) {
		return
	}
	mr.Data = bytes
	jsonBytes, err := json.Marshal(mr)
	if host.HandleErr(err, ctx) {
		return
	}
	ctx.Write(jsonBytes)
}

// Import POST /api/import/keys
func ImportKeys(ctx host.IHttpContext) {
	ctx.SetContentType(core.ContentTypeJson)

	var bytes []byte
	ctx.ReadJSON(&bytes)
	mr := new(core.MsgResult)
	if bytes == nil || len(bytes) < 3 {
		host.HandleErr(serr.New("import data missing"), ctx)
		return
	}

	client := helpers.GetClient(ctx)
	importer := io.NewImporter(client)
	imported, err := importer.ImportKeys(bytes)
	if host.HandleErr(err, ctx) {
		return
	}

	mr.Data = imported
	jsonBytes, err := json.Marshal(mr)
	u.LogError(err)
	if host.HandleErr(err, ctx) {
		return
	}
	ctx.Write(jsonBytes)
}

// Export POST /api/export/file
func ExportFile(ctx host.IHttpContext) {
	// var keys []string
	// ctx.ReadJSON(&keys)
	keysStr := ctx.GetFormString("keys")
	keys := strings.Split(keysStr, ",")
	if keys == nil || len(keys) == 0 {
		ctx.SetStatusCode(http.StatusBadRequest)
		return
	}
	dbStr := ctx.GetFormString("db")
	if dbStr == "" {
		dbStr = "0"
	}
	client := helpers.GetClient(ctx)
	exporter := io.NewExporter(false, client)
	bytes, err := exporter.ExportZipFile(keys...)
	u.LogError(err)
	if !host.HandleErr(err, ctx) {
		ctx.SetContentType("application/octet-stream")
		ctx.SetHeader("Content-Disposition", fmt.Sprintf("attachment;filename=%s-%s.rmd", dbStr, time.Now().Format("20060102-150405")))
		ctx.Write(bytes)
	}
}

// Import POST /api/import/file
func ImportFile(ctx host.IHttpContext) {
	fileHeader, err := ctx.GetFormFile("file")
	if host.HandleErr(err, ctx) {
		return
	}
	file, err := fileHeader.Open()
	defer func() {
		file.Close()
	}()

	client := helpers.GetClient(ctx)
	importer := io.NewImporter(client)

	_, err = importer.ImportZipFile(file, fileHeader.Size)
	u.LogError(err)
	host.HandleErr(err, ctx)
}
