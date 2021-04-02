package core

import (
	"encoding/json"
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
	if len(x.ClientProviders) > 0 {
		return x.ClientProviders[0]
	}
	return nil
}

func (x *ServerManager) GetSelectedRedisManager() *RedisClientProvider {
	if len(x.ClientProviders) > 0 {
		return x.ClientProviders[0]
	}
	return nil
}

// func (x *ServerManager) Add(redisConfigs ...*RedisConfigX) error {
// 	for _, rc := range redisConfigs {
// 		x.add(rc)
// 	}
// 	var err error
// 	x.ClientProviders, err = x.generateClientProvider()
// 	err1 := x.save()
// 	u.LogError(err1)
// 	return err
// }

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

func (x *ServerManager) Save(server *RedisConfigX) error {
	if server.ID == "" {
		x.add(server)
	} else {
		found := -1
		for i, rc := range x.Servers {
			if rc.ID == server.ID {
				found = i
				rc.Addrs = server.Addrs
				rc.DB = server.DB
				rc.Name = server.Name
				rc.Password = server.Password
				x.generateName(rc)
				break
			}
		}
		if found < 0 {
			// if not found, still add
			x.add(server)
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

	err = os.WriteFile(_filename, data, 0666)
	return err
}

func (x *ServerManager) load() error {
	data, err := os.ReadFile(_filename)
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
	x.generateName(rc)
	x.Servers = append(x.Servers, rc)
}

func (x *ServerManager) generateName(rc *RedisConfigX) {
	if rc.Name == "" {
		rc.Name = strings.Join(rc.Addrs, ",")
	}
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
