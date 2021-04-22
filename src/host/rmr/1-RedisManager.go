package rmr

import (
	"encoding/json"
	"os"

	"github.com/syncfuture/go/serr"
	"github.com/syncfuture/go/u"
	"github.com/syncfuture/host"
)

const _filename = "./Servers.json"

type RedisManager struct {
	// Servers []*RedisServer
	Configs []*ServerConfig
	Servers map[string]*RedisServer
}

func NewRedisManager() *RedisManager {
	r := new(RedisManager)
	err := r.load()
	u.LogFaltal(err)
	r.Servers = r.generateServers()
	return r
}

func (x *RedisManager) GetSelectedServer() *RedisServer {
	for _, v := range x.Servers {
		if v.config.Selected {
			return v
		}
	}

	return nil
}

func (x *RedisManager) GetServer(serverID string) *RedisServer {
	// if r, ok := x.Servers[serverID]; ok {
	// 	return r
	// }

	return x.Servers[serverID]
}

// func (x *ServerManager) Add(redisConfigs ...*RedisConfigX) error {
// 	for _, rc := range redisConfigs {
// 		x.add(rc)
// 	}
// 	var err error
// 	x.Servers, err = x.generateServer()
// 	err1 := x.save()
// 	u.LogError(err1)
// 	return err
// }

func (x *RedisManager) Remove(id string) (err error) {
	x.Servers = x.generateServers()
	err = x.save()
	return err
}

func (x *RedisManager) Select(id string) error {
	for _, sc := range x.Configs {
		// if sc.ID == id {
		// 	x.removeByIndex(i)
		// 	x.Configs = append([]*ServerConfig{sc}, x.Configs...)
		// 	break
		// }
		sc.Selected = sc.ID == id
	}

	// x.Servers = x.generateServers()
	err := x.save()
	return err
}

func (x *RedisManager) Save(in *ServerConfig) (err error) {
	if in.ID == "" {
		x.add(in)
	} else {
		found := -1
		for i, config := range x.Configs {
			if config.ID == in.ID {
				found = i
				config.Addrs = in.Addrs
				config.Name = in.Name
				config.Password = in.Password
				x.generateName(config)
				break
			}
		}
		if found < 0 {
			// if not found, still add
			x.add(in)
		}
	}

	x.Servers = x.generateServers()

	err = x.save()
	return err
}

func (x *RedisManager) save() error {
	data, err := json.Marshal(x.Configs)
	if err != nil {
		return serr.WithStack(err)
	}

	err = os.WriteFile(_filename, data, 0666)
	return serr.WithStack(err)
}

func (x *RedisManager) load() error {
	data, err := os.ReadFile(_filename)
	if err != nil {
		if os.IsNotExist(err) {
			x.Configs = make([]*ServerConfig, 0)
			return nil
		}
		return serr.WithStack(err)
	}

	err = json.Unmarshal(data, &x.Configs)
	return serr.WithStack(err)
}

func (x *RedisManager) generateServers() (r map[string]*RedisServer) {
	r = make(map[string]*RedisServer, len(x.Configs))

	// errs := make([]error, 0)
	for _, config := range x.Configs {
		r[config.ID] = NewRedisServer(config)
	}

	return r
}

func (x *RedisManager) add(rc *ServerConfig) {
	rc.ID = host.GenerateID()
	x.generateName(rc)
	x.Configs = append(x.Configs, rc)
	x.Select(rc.ID) // set new item as selected
}

func (x *RedisManager) generateName(config *ServerConfig) {
	if config.Name == "" {
		// rc.Name = strings.Join(rc.Addrs, ",")
		config.Name = config.ID
	}
}

func (x *RedisManager) removeByID(id string) {
	for i, sc := range x.Configs {
		if sc.ID == id {
			x.removeByIndex(i)
			break
		}
	}
}

func (x *RedisManager) removeByIndex(idx int) {
	x.Configs = append(x.Configs[:idx], x.Configs[idx+1:]...)
}
