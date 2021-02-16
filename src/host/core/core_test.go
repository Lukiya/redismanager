package core

import (
	"testing"
)

func TestServerManager(t *testing.T) {
	sm := NewServerManager()

	a := new(RedisConfigX)
	a.Addrs = []string{"localhost:6379"}
	a.Password = "Famous901"
	sm.add(a)
	b := new(RedisConfigX)
	b.Addrs = []string{"127.0.0.1:6379"}
	b.Password = "Famous901"
	sm.add(b)
	c := new(RedisConfigX)
	c.Addrs = []string{"192.168.188.166:6379"}
	c.Password = "Famous901"
	sm.add(c)

	sm.save()
}

func TestSelect(t *testing.T) {
	sm := NewServerManager()
	sm.Select("4bd37739b02bca6")
}
