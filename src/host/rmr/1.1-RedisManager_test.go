package rmr

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewRedisManager(t *testing.T) {
	m := NewRedisManager()

	newConfig := &ServerConfig{
		Addrs: []string{"localhost:6380"},
	}
	err := m.Save(newConfig)
	assert.NoError(t, err)
	assert.NotEmpty(t, newConfig.ID)

	a, err := m.GetServer(newConfig.ID)
	assert.NoError(t, err)
	assert.NotNil(t, a)

	err = m.Select(newConfig.ID)
	assert.NoError(t, err)

	a, err = m.GetSelectedServer()
	assert.NoError(t, err)
	assert.NotNil(t, a)

	err = m.Remove(newConfig.ID)
	assert.NoError(t, err)
}
