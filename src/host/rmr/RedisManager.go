package rmr

import (
	"encoding/json"
	"os"

	"github.com/syncfuture/go/serr"
	"github.com/syncfuture/go/u"
	"github.com/syncfuture/host"
)

const _filename = "./clusters.json"

type RedisManager struct {
	// Clusters []*RedisCluster
	Configs  []*ClusterConfig
	Clusters map[string]*RedisCluster
}

func NewRedisManager() *RedisManager {
	r := new(RedisManager)
	err := r.load()
	u.LogFaltal(err)
	r.Clusters = r.generateClusters()
	return r
}

func (x *RedisManager) GetSelectedCluster() *RedisCluster {
	for _, v := range x.Clusters {
		return v
	}

	return nil
}

// func (x *ServerManager) Add(redisConfigs ...*RedisConfigX) error {
// 	for _, rc := range redisConfigs {
// 		x.add(rc)
// 	}
// 	var err error
// 	x.Clusters, err = x.generateCluster()
// 	err1 := x.save()
// 	u.LogError(err1)
// 	return err
// }

func (x *RedisManager) Remove(id string) error {
	x.removeByID(id)
	x.Clusters = x.generateClusters()
	err := x.save()
	return err
}

func (x *RedisManager) Select(id string) error {
	for i, sc := range x.Configs {
		if sc.ID == id {
			x.removeByIndex(i)
			x.Configs = append([]*ClusterConfig{sc}, x.Configs...)
			break
		}
	}

	x.Clusters = x.generateClusters()
	err := x.save()
	return err
}

func (x *RedisManager) Save(config *ClusterConfig) error {
	if config.ID == "" {
		x.add(config)
	} else {
		found := -1
		for i, rc := range x.Configs {
			if rc.ID == config.ID {
				found = i
				rc.Addrs = config.Addrs
				rc.DB = config.DB
				rc.Name = config.Name
				rc.Password = config.Password
				x.generateName(rc)
				break
			}
		}
		if found < 0 {
			// if not found, still add
			x.add(config)
		}
	}

	x.Clusters = x.generateClusters()
	err := x.save()
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
			x.Configs = make([]*ClusterConfig, 0)
			return nil
		}
		return serr.WithStack(err)
	}

	err = json.Unmarshal(data, &x.Configs)
	return serr.WithStack(err)
}

func (x *RedisManager) generateClusters() map[string]*RedisCluster {
	r := make(map[string]*RedisCluster, len(x.Configs))

	// errs := make([]error, 0)
	for _, sc := range x.Configs {
		cluster := NewRedisCluster(sc)
		r[cluster.config.ID] = cluster
		// a, err := NewRedisCluster(sc)
		// if err != nil {
		// 	errs = append(errs, err)
		// 	x.removeByIndex(i)
		// 	continue
		// }
		// r = append(r, cluster)
	}

	// err := u.JointErrors(errs...)

	// return r, err
	return r
}

func (x *RedisManager) add(rc *ClusterConfig) {
	rc.ID = host.GenerateID()
	x.generateName(rc)
	x.Configs = append(x.Configs, rc)
}

func (x *RedisManager) generateName(rc *ClusterConfig) {
	if rc.Name == "" {
		// rc.Name = strings.Join(rc.Addrs, ",")
		rc.Name = rc.ID
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
