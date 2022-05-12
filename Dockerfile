FROM scratch
WORKDIR /app
COPY redismanager ./
COPY configs.json ./
ENTRYPOINT ["./redismanager"]