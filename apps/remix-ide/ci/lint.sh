#!/usr/bin/env bash

set -e

BUILD_ID=${CIRCLE_BUILD_NUM:-${TRAVIS_JOB_NUMBER}}
echo "$BUILD_ID"
TEST_EXITCODE=0

KEYS=$(jq -r '.projects | keys' workspace.json  | tr -d '[],"')

(for row in $KEYS; do
    if [ "$row" != "debugger" ]
    then
        echo ${row}
    fi
done) | circleci tests split | { while read i;do yarn run lint $i; done }

echo "$TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]
then
  exit 1
fi
