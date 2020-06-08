#!/bin/bash
set -e

# If not staging and master branch are existing
export TAG="$CIRCLE_BRANCH"

docker login --username $DOCKER_USER --password $DOCKER_PASS
docker-compose build
docker push remixproject/remix-ide:$TAG
