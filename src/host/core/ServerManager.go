package core

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"strings"

	"github.com/syncfuture/go/sid"
	"github.com/syncfuture/go/u"
)

const _filename = "./servers.json"

type ServerManager struct {
	Servers         []*RedisConfigX
	ClientProviders []*RedisClientProvider
	idGenerator     sid.IIDGenerator
}

func NewServerManager() *ServerManager {
	r := new(ServerManager)
	err := r.load()
	u.LogFaltal(err)
	r.idGenerator = sid.NewSonyflakeIDGenerator()
	r.ClientProviders, err = r.generateClientProvider()
	u.LogFaltal(err)
	return r
}

func (x *ServerManager) GetSelectedClientProvider() *RedisClientProvider {
	return x.ClientProviders[0]
}

func (x *ServerManager) Add(redisConfigs ...*RedisConfigX) error {
	for _, rc := range redisConfigs {
		x.add(rc)
	}
	var err error
	x.ClientProviders, err = x.generateClientProvider()
	err1 := x.save()
	u.LogError(err1)
	return err
}

func (x *ServerManager) Remove(id string) error {
	x.removeByID(id)
	var err error
	x.ClientProviders, err = x.generateClientProvider()
	err1 := x.save()
	u.LogError(err1)
	return err
}

func (x *ServerManager) Select(id string) error {
	for i, sc := range x.Servers {
		if sc.ID == id {
			x.removeByIndex(i)
			x.Servers = append([]*RedisConfigX{sc}, x.Servers...)
			break
		}
	}

	var err error
	x.ClientProviders, err = x.generateClientProvider()
	err1 := x.save()
	u.LogError(err1)
	return err
}

func (x *ServerManager) save() error {
	data, err := json.Marshal(x.Servers)
	if err != nil {
		return err
	}

	err = ioutil.WriteFile(_filename, data, 0666)
	return err
}

func (x *ServerManager) load() error {
	data, err := ioutil.ReadFile(_filename)
	if err != nil {
		if os.IsNotExist(err) {
			x.Servers = make([]*RedisConfigX, 0)
			return nil
		}
		return err
	}

	err = json.Unmarshal(data, &x.Servers)
	return err
}

func (x *ServerManager) generateClientProvider() ([]*RedisClientProvider, error) {
	r := make([]*RedisClientProvider, 0, len(x.Servers))

	errs := make([]error, 0)
	for i, sc := range x.Servers {
		a, err := NewRedisClientProvider(sc)
		if err != nil {
			errs = append(errs, err)
			x.removeByIndex(i)
			continue
		}
		r = append(r, a)
	}

	err := u.JointErrors(errs...)

	return r, err
}

func (x *ServerManager) add(rc *RedisConfigX) {
	rc.ID = x.idGenerator.GenerateString()
	if rc.Name == "" {
		rc.Name = strings.Join(rc.Addrs, ",")
	}
	x.Servers = append(x.Servers, rc)
}

func (x *ServerManager) removeByID(id string) {
	for i, sc := range x.Servers {
		if sc.ID == id {
			x.removeByIndex(i)
			break
		}
	}
}

func (x *ServerManager) removeByIndex(idx int) {
	x.Servers = append(x.Servers[:idx], x.Servers[idx+1:]...)
}
