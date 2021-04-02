package main

import (
	"fmt"
	"log"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/Lukiya/redismanager/src/go/handlers"
)

func main() {
	core.Host.GET("/keys", handlers.GetKeys)
	core.Host.GET("/dbs", handlers.GetDBs)
	core.Host.GET("/configs", handlers.GetConfigs)
	core.Host.GET("/entry", handlers.GetEntry)
	core.Host.GET("/hash", handlers.GetHashElements)
	core.Host.GET("/list", handlers.GetListElements)
	core.Host.GET("/set", handlers.GetSetElements)
	core.Host.GET("/zset", handlers.GetZSetElements)
	core.Host.POST("/entry", handlers.SaveEntry)
	core.Host.POST("/export/keys", handlers.ExportKeys)
	core.Host.POST("/import/keys", handlers.ImportKeys)
	core.Host.POST("/export/file", handlers.ExportFile)
	core.Host.POST("/import/file", handlers.ImportFile)
	core.Host.DELETE("/keys", handlers.DeleteKeys)
	core.Host.DELETE("/members", handlers.DeleteMembers)
	core.Host.POST("/server", handlers.SaveServer)
	core.Host.GET("/servers", handlers.GetServers)
	core.Host.POST("/servers/{id}", handlers.SelectServer)
	core.Host.DELETE("/servers/{id}", handlers.RemoveServer)

	fmt.Println("------------------------------------------------")
	fmt.Println("-             Redis Manager v2.0.0             -")
	fmt.Println("------------------------------------------------")

	log.Fatal(core.Host.Run())
}
