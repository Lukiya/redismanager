#!/bin/sh
docker rm -f redismanager
docker rmi redismanager
docker load -i ./redismanager.tar
docker run --name redismanager -d --restart always -p 16379:16379 -v /data/redismanager/configs.json:/app/configs.json redismanager