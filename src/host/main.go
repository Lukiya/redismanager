package main

import (
	"fmt"
	"log"

	"github.com/Lukiya/redismanager/src/go/api"
	"github.com/Lukiya/redismanager/src/go/core"
)

func main() {
	// core.Host.GET("/api/keys", api.GetKeys)
	// core.Host.GET("/api/dbs", api.GetDBs)
	// core.Host.GET("/api/configs", api.GetConfigs)

	// core.Host.GET("/api/entry", api.GetEntry)
	// core.Host.POST("/api/entry", api.SaveEntry)

	// core.Host.GET("/api/hash", api.GetHashElements)
	// core.Host.GET("/api/list", api.GetListElements)
	// core.Host.GET("/api/set", api.GetSetElements)
	// core.Host.GET("/api/zset", api.GetZSetElements)

	// // delete
	// core.Host.DELETE("/api/keys", api.DeleteKeys)
	// core.Host.DELETE("/api/members", api.DeleteMembers)

	// // io
	// core.Host.POST("/api/export/keys", api.ExportKeys)
	// core.Host.POST("/api/import/keys", api.ImportKeys)
	// core.Host.POST("/api/export/file", api.ExportFile)
	// core.Host.POST("/api/import/file", api.ImportFile)

	core.Host.AddActionGroups(
		api.ClusterGroup,
	)

	fmt.Println("------------------------------------------------")
	fmt.Println("-             Redis Manager v2.0.0             -")
	fmt.Println("------------------------------------------------")

	log.Fatal(core.Host.Run())
}
