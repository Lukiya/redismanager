package main

import (
	"testing"
)

func TestExport(t *testing.T) {
	// client := sredis.NewClient(core.RedisConfig)
	// a := io.NewExporter(true, client)
	// b, err := a.ExportKeys("A001", "A002", "A003", "A004", "A005")
	// assert.NoError(t, err)
	// assert.NotEmpty(t, b)

	// os.WriteFile("M:\\test.json", b, 666)
}

func TestImport(t *testing.T) {
	// data, err := os.ReadFile("M:\\test.json")
	// assert.NoError(t, err)

	// config := &RedisConfigX{
	// 	Addrs:    []string{"192.168.188.166:6379"},
	// 	Password: "Famous901",
	// 	DB:       15,
	// }
	// client := sredis.NewClient(config)
	// a := io.NewImporter(client)
	// _, err = a.ImportKeys(data)
	// assert.NoError(t, err)
}

func TestFillData(t *testing.T) {
	// config := &RedisConfigX{
	// 	Addrs:    []string{"192.168.188.166:6379"},
	// 	Password: "Famous901",
	// 	DB:       0,
	// }
	// client := sredis.NewClient(config)

	// max := 139
	// // for i := 0; i < max; i++ {
	// // 	f := "field-" + strconv.Itoa(i)
	// // 	v := "value " + strconv.Itoa(i)
	// // 	err := client.HSet("testdata", f, v).Err()
	// // 	if u.LogError(err) {
	// // 		return
	// // 	}
	// // }

	// for i := 0; i < max; i++ {
	// 	k := "str-" + strconv.Itoa(i)
	// 	v := "value " + strconv.Itoa(i)
	// 	client.Set(k, v, time.Duration(-1))
	// }
}
