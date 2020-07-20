#!/bin/bash
set -e

export TAG="$CIRCLE_BRANCH"

if [ "$CIRCLE_BRANCH" == "master" ]; then
    export TAG="latest";
fi

rm -rf temp_publish_docker
mkdir temp_publish_docker
cp -r $FILES_TO_PACKAGE temp_publish_docker

docker login --username $DOCKER_USER --password $DOCKER_PASS
docker-compose -f ../../../docker-compose.yaml -f ../../../build.yaml build
docker push remixproject/remix-ide:$TAG
