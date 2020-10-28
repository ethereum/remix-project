#!/bin/bash
set -e

export TAG="$CIRCLE_BRANCH"

if [ "$CIRCLE_BRANCH" == "master" ]; then
    export TAG="latest";
fi

docker login --username $DOCKER_USER --password $DOCKER_PASS
docker-compose -f docker-compose.yaml -f build.yaml build
docker push remixproject/remix-ide:$TAG
