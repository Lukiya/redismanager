package main

import (
	"io/ioutil"
	"testing"

	"github.com/syncfuture/go/sredis"

	"github.com/Lukiya/redismanager/src/go/io"

	"github.com/stretchr/testify/assert"

	"github.com/Lukiya/redismanager/src/go/core"
)

func TestExport(t *testing.T) {
	client := sredis.NewClient(core.RedisConfig)
	a := io.NewExporter(true, client)
	b, err := a.ExportKeys("A001", "A002", "A003", "A004", "A005")
	assert.NoError(t, err)
	assert.NotEmpty(t, b)

	ioutil.WriteFile("M:\\test.json", b, 666)
}

func TestImport(t *testing.T) {
	data, err := ioutil.ReadFile("M:\\test.json")
	assert.NoError(t, err)

	config := &sredis.RedisConfig{
		Addrs:    []string{"192.168.188.166:6379"},
		Password: "Famous901",
		DB:       15,
	}
	client := sredis.NewClient(config)
	a := io.NewImporter(client)
	_, err = a.ImportKeys(data)
	assert.NoError(t, err)
}
