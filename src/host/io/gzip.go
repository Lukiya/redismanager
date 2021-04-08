package io

import (
	"bytes"

	"github.com/syncfuture/go/serr"
	"google.golang.org/grpc"
)

var (
	_compressor   = grpc.NewGZIPCompressor()
	_decompressor = grpc.NewGZIPDecompressor()
)

func zipBytes(in []byte) (out []byte, err error) {
	var buf bytes.Buffer
	err = _compressor.Do(&buf, in)
	return buf.Bytes(), serr.WithStack(err)
}

func unzipBytes(in []byte) (out []byte, err error) {
	buf := bytes.NewBuffer(in)
	out, err = _decompressor.Do(buf)
	return out, serr.WithStack(err)
}
