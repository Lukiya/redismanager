package rmr

import (
	"testing"

	"github.com/Lukiya/redismanager/src/go/shared"
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

	scanResult, err := db.GetAllKeys(&ScanQuerySet{
		// Keyword: "STR*",
		Query: &ScanQuery{
			Count: 800,
		},
	})
	assert.NoError(t, err)
	assert.NotEmpty(t, scanResult.Keys)
	t.Log(len(scanResult.Keys))

	key, err := db.GetKey("HASH_00001")
	assert.NoError(t, err)
	assert.NotNil(t, key)

	members, err := db.ScanElements(&ScanQuerySet{
		Key:  "HASH_00001",
		Type: shared.RedisType_Hash,
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

	err = db.SaveEntry(&SaveRedisEntryCommand{
		New: &RedisEntry{
			RedisKey: &RedisKey{
				Key:  "AAA" + key + "1",
				Type: shared.RedisType_String,
				TTL:  3600,
			},
			Value: key,
		},
		Old: &RedisEntry{
			RedisKey: &RedisKey{
				Key:  key + "1",
				Type: shared.RedisType_String,
				TTL:  3600,
			},
			Value: key,
		},
		IsNew: false,
	})
	assert.NoError(t, err)

	redisKey, err := db.GetKey("AAA" + key + "1")
	assert.NoError(t, err)
	assert.Greater(t, redisKey.TTL, int64(100))
}
