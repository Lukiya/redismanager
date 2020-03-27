package io

import (
	"encoding/json"

	"github.com/syncfuture/go/u"
)

type ExportFileEntry struct {
	Key  string `json:"key"`
	Type string `json:"Type"`
	Data []byte `json:"data"`
}

func NewExportFileEntry(entryKey, entryType string, entryData interface{}) (*ExportFileEntry, error) {
	d, err := json.Marshal(entryData)
	if u.LogError(err) {
		return nil, err
	}
	r := &ExportFileEntry{
		Key:  entryKey,
		Type: entryType,
		Data: d,
	}

	return r, err
}
