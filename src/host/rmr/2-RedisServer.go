package rmr

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"net"
	"sync"

	"github.com/Lukiya/redismanager/src/go/shared"
	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/sconv"
	"github.com/syncfuture/go/serr"
	"github.com/syncfuture/go/u"
)

func NewRedisServer(config *ServerConfig) *RedisServer {
	return &RedisServer{
		ID:     config.ID,
		Name:   config.Name,
		config: config,
	}
}

type RedisServer struct {
	ID     string
	Name   string
	config *ServerConfig
	DBs    []IRedisDB
}

func (x *RedisServer) Connect() error {
	if len(x.DBs) == 0 {
		clusterOptions := &redis.ClusterOptions{
			Addrs:    x.config.Addrs,
			Username: x.config.Username,
			Password: x.config.Password,
		}
		if x.config.TLS != nil && x.config.TLS.Key != "" && x.config.TLS.CACert != "" && x.config.TLS.Cert != "" {
			// Has tls config, use tls connection

			cert, err := tls.X509KeyPair(u.StrToBytes(x.config.TLS.Cert), u.StrToBytes(x.config.TLS.Key))
			if err != nil {
				return serr.WithStack(err)
			}
			caCert := u.StrToBytes(x.config.TLS.CACert)
			pool := x509.NewCertPool()
			pool.AppendCertsFromPEM(caCert)

			clusterOptions.TLSConfig = &tls.Config{
				MinVersion:         tls.VersionTLS12,
				InsecureSkipVerify: true,
				Certificates:       []tls.Certificate{cert},
				RootCAs:            pool,
				// ServerName:   "192.168.188.200",
			}
		}

		clusterClient := redis.NewClusterClient(clusterOptions)

		masterClients := make(map[string]*redis.Client, 0)
		ctx := context.Background()
		locker := new(sync.Mutex)
		err := clusterClient.ForEachMaster(ctx, func(c context.Context, client *redis.Client) error {
			locker.Lock()
			id := generateClientID(client)
			masterClients[id] = client
			locker.Unlock()
			return nil
		})

		if err != nil {
			if _, ok := err.(*net.OpError); ok {
				return serr.WithStack(shared.ConnectServerFailedError)
			} else if err.Error() == _clusterDisabedError {
				////////// Standalone
				x.DBs, err = x.getDBs()
				if err != nil {
					return err
				}
				return nil
			}
			return serr.WithStack(err)
		}

		db := NewClusterRedisDB(clusterClient, masterClients)
		x.DBs = []IRedisDB{db}
	}

	return nil
}

func (x *RedisServer) BGSave() (string, error) {
	db0Client := redis.NewClient(&redis.Options{
		Addr:     x.config.Addrs[0],
		Password: x.config.Password,
		DB:       0,
	})

	cmd := db0Client.BgSave(context.Background())
	r, err := cmd.Result()
	if err != nil {
		return "", serr.WithStack(err)
	}

	return r, nil
}

func (x *RedisServer) getDBs() ([]IRedisDB, error) {
	options := &redis.Options{
		Addr:     x.config.Addrs[0],
		Username: x.config.Username,
		Password: x.config.Password,
		DB:       0,
	}

	if x.config.TLS != nil && x.config.TLS.Key != "" && x.config.TLS.CACert != "" && x.config.TLS.Cert != "" {
		// Has tls config, use tls connection

		cert, err := tls.X509KeyPair(u.StrToBytes(x.config.TLS.Cert), u.StrToBytes(x.config.TLS.Key))
		if err != nil {
			return nil, serr.WithStack(err)
		}
		caCert := u.StrToBytes(x.config.TLS.CACert)
		pool := x509.NewCertPool()
		pool.AppendCertsFromPEM(caCert)

		options.TLSConfig = &tls.Config{
			MinVersion:         tls.VersionTLS12,
			InsecureSkipVerify: true,
			Certificates:       []tls.Certificate{cert},
			RootCAs:            pool,
			// ServerName:   "192.168.188.200",
		}
	}

	db0Client := redis.NewClient(options)

	databases, err := db0Client.ConfigGet(context.Background(), "databases").Result()
	if err != nil {
		return nil, serr.WithStack(err)
	}
	dbcount := sconv.ToInt(databases[1])

	dbs := make([]IRedisDB, 0, dbcount)
	dbs = append(dbs, NewStandaloneRedisDB(db0Client, 0))

	for i := 1; i < dbcount; i++ { // skip db0 since it's already been added
		client := redis.NewClient(&redis.Options{
			Addr:     x.config.Addrs[0],
			Password: x.config.Password,
			DB:       i,
		})
		dbs = append(dbs, NewStandaloneRedisDB(client, i))
	}

	return dbs, nil
}

func (x *RedisServer) GetDB(db int) (IRedisDB, error) {
	if db < 0 || db > len(x.DBs)-1 {
		return nil, serr.New("db index out of range")
	} else {
		return x.DBs[db], nil
	}
}
