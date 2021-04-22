package rmr

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestStandaloneRedisServer(t *testing.T) {
	s := NewRedisServer(&ServerConfig{
		Addrs: []string{"localhost:6380"},
	})

	err := s.Connect()
	assert.NoError(t, err)

	db, err := s.GetDB(15)
	assert.NoError(t, err)
	assert.NotNil(t, db)
}

func TestClusterRedisServer(t *testing.T) {
	s := NewRedisServer(&ServerConfig{
		Addrs: []string{"localhost:7000"},
	})

	err := s.Connect()
	assert.NoError(t, err)

	db, err := s.GetDB(0)
	assert.NoError(t, err)
	assert.NotNil(t, db)
}
