There are two `Dockerfiles` that are useful for developing/deploying flamingo.

### Testing

Use the `test/Dockerfile` to build a docker instance that runs tests:

```
docker build -f test/Dockerfile -t flamingo-test .
docker run flamingo-test:latest
```

### Deploying

Use the `Dockerfile` to build a docker instance that starts flamingo with [forever](https://github.com/foreverjs/forever):

```
docker build flamingo .
docker run flamingo:latest
```

In addition you can configure the flamingo instance using environment parameters:

```
docker run -e CRYPTO_IV=123456 -e ACCESS_HTTPS_ENABLED=true flamingo:latest
```
