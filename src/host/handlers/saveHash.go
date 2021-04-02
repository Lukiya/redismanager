package handlers

import (
	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/go-redis/redis/v7"
	"github.com/syncfuture/go/u"
)

func saveHash(client redis.Cmdable, cmd *core.SaveRedisEntryCommand) (err error) {
	if cmd.Editing.IsNew {
		err = client.HSet(cmd.Editing.Key, cmd.Editing.Field, cmd.Editing.Value).Err()
		u.LogError(err)
	} else if cmd.Editing.Key != cmd.Backup.Key {
		// # rename key
		err = client.Rename(cmd.Backup.Key, cmd.Editing.Key).Err()
		if err != nil {
			return err
		}

		if cmd.Editing.Field != cmd.Backup.Field {
			// #rename field while renaming key
			err = renameHashField(client, cmd.Editing.Key, cmd.Backup.Field, cmd.Editing.Field, cmd.Editing.Value)
		}

	} else if cmd.Editing.Field != cmd.Backup.Field {
		// # rename field
		err = renameHashField(client, cmd.Editing.Key, cmd.Backup.Field, cmd.Editing.Field, cmd.Editing.Value)
	} else {
		// # update value
		err = client.HSet(cmd.Editing.Key, cmd.Editing.Field, cmd.Editing.Value).Err()
		u.LogError(err)
	}

	return
}

func renameHashField(client redis.Cmdable, key, oldField, newFiled string, value interface{}) (err error) {
	// set value to new field
	err = client.HSet(key, newFiled, value).Err()
	if err != nil {
		return err
	}

	// delete old field
	err = client.HDel(key, oldField).Err()
	u.LogError(err)
	return
}
