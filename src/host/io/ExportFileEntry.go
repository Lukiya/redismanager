package io

import (
	"encoding/json"

	"github.com/syncfuture/go/serr"
)

type ExportFileEntry struct {
	Key  string `json:"key"`
	Type string `json:"Type"`
	Data []byte `json:"data"`
}

func NewExportFileEntry(entryKey, entryType string, entryData interface{}) (*ExportFileEntry, error) {
	d, err := json.Marshal(entryData)
	if err != nil {
		return nil, serr.WithStack(err)
	}
	r := &ExportFileEntry{
		Key:  entryKey,
		Type: entryType,
		Data: d,
	}

	return r, nil
}
