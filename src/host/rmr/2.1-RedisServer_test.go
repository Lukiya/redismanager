package rmr

import (
	"testing"

	"github.com/Lukiya/redismanager/src/go/common"
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

	keys, err := db.GetAllKeys(&ScanQuerySet{
		// Keyword: "STR*",
		Query: &ScanQuery{
			Count: 100,
		},
	})
	assert.NoError(t, err)
	assert.NotEmpty(t, keys)
	t.Log(len(keys))

	key, err := db.GetKey("HASH_00001")
	assert.NoError(t, err)
	assert.NotNil(t, key)

	members, err := db.GetElements(&ScanQuerySet{
		Key:  "HASH_00001",
		Type: common.RedisType_Hash,
		Query: &ScanQuery{
			Count: 100,
		},
	})
	assert.NoError(t, err)
	assert.NotEmpty(t, members)

	exist, err := db.KeyExists("ZSET_00001")
	assert.NoError(t, err)
	assert.True(t, exist)
}

func TestSaveString(t *testing.T) {
	s := NewRedisServer(&ServerConfig{
		Addrs: []string{"localhost:7000"},
	})

	err := s.Connect()
	assert.NoError(t, err)

	db, err := s.GetDB(0)
	assert.NoError(t, err)
	assert.NotNil(t, db)

	key := "STRNEW"

	err = db.SaveValue(&SaveRedisEntryCommand{
		New: &RedisEntry{
			Key:   "AAA" + key + "1",
			Type:  common.RedisType_String,
			Value: key,
			TTL:   3600,
		},
		Old: &RedisEntry{
			Key:   key + "1",
			Type:  common.RedisType_String,
			Value: key,
			TTL:   3600,
		},
		IsNew: false,
	})
	assert.NoError(t, err)

	redisKey, err := db.GetKey("AAA" + key + "1")
	assert.NoError(t, err)
	assert.Greater(t, redisKey.TTL, int64(100))
}
