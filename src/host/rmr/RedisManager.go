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
	r.Clusters, err = r.generateClusters()
	u.LogFaltal(err)
	return r
}

func (x *RedisManager) GetSelectedCluster() *RedisCluster {
	for _, v := range x.Clusters {
		if v.config.Selected {
			return v
		}
	}

	return nil
}

func (x *RedisManager) GetCluster(clusterID string) *RedisCluster {
	for _, v := range x.Clusters {
		if v.ID == clusterID {
			return v
		}
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

func (x *RedisManager) Remove(id string) (err error) {
	x.Clusters, err = x.generateClusters()
	if err != nil {
		return err
	}
	err = x.save()
	return err
}

func (x *RedisManager) Select(id string) error {
	for _, sc := range x.Configs {
		// if sc.ID == id {
		// 	x.removeByIndex(i)
		// 	x.Configs = append([]*ClusterConfig{sc}, x.Configs...)
		// 	break
		// }
		sc.Selected = sc.ID == id
	}

	// x.Clusters = x.generateClusters()
	err := x.save()
	return err
}

func (x *RedisManager) Save(config *ClusterConfig) (err error) {
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

	x.Clusters, err = x.generateClusters()
	if err != nil {
		return err
	}

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
			x.Configs = make([]*ClusterConfig, 0)
			return nil
		}
		return serr.WithStack(err)
	}

	err = json.Unmarshal(data, &x.Configs)
	return serr.WithStack(err)
}

func (x *RedisManager) generateClusters() (r map[string]*RedisCluster, err error) {
	r = make(map[string]*RedisCluster, len(x.Configs))

	// errs := make([]error, 0)
	for _, sc := range x.Configs {
		r[sc.ID], err = NewRedisCluster(sc)
		if err != nil {
			return nil, err
		}
	}

	return r, err
}

func (x *RedisManager) add(rc *ClusterConfig) {
	rc.ID = host.GenerateID()
	x.generateName(rc)
	x.Configs = append(x.Configs, rc)
	x.Select(rc.ID) // set new item as selected
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
