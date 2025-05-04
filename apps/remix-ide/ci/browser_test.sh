#!/usr/bin/env bash

set -e

# if $1 is chrome
# if [ "$1" == "chrome" ]; then
# # 1) Start ChromeDriver in the background
# /usr/local/bin/chromedriver \
#   --port=9515 \
#   --host=127.0.0.1 \
#   --silent > driver.log 2>&1 &


# # Save its PID so you can kill it later if needed
# echo $! > chromedriver.pid

# # 2) Wait until ChromeDriver is actually listening
# while ! curl -s http://127.0.0.1:9515/status >/dev/null; do
#   sleep 0.2
# done

# echo "🚀 ChromeDriver is up on 127.0.0.1:9515"

# fi

export DBUS_SESSION_BUS_ADDRESS=/dev/null
export XDG_RUNTIME_DIR=/tmp

BUILD_ID=${CIRCLE_BUILD_NUM:-${TRAVIS_JOB_NUMBER}}
echo "$BUILD_ID"
TEST_EXITCODE=0
npx ganache &
npx http-server -p 9090 --cors='*' ./node_modules &
yarn run serve:production &

# Wait for Ganache (default port 8545) via JSON-RPC
echo "Waiting for Ganache on port 8545 (eth_blockNumber)..."
until curl --silent --fail \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}' \
  http://127.0.0.1:8545 > /dev/null; do
  sleep 1
done

# Wait for http-server on port 9090
echo "Waiting for http-server on port 9090..."
until curl --silent --fail http://127.0.0.1:9090 > /dev/null; do
  sleep 1
done

# Wait for Remix serve:production on port 8080
echo "Waiting for Remix server on port 8080..."
until curl --silent --fail http://127.0.0.1:8080 > /dev/null; do
  sleep 1
done

# grep -IRiL "@disabled" "dist/apps/remix-ide-e2e/src/tests" | grep "\.spec\|\.test" | xargs -I {} basename {} .test.js | grep -E "\b[${2}]"
# TESTFILES=$(grep -IRiL "@disabled" "dist/apps/remix-ide-e2e/src/tests" | grep "\.spec\|\.test" | xargs -I {} basename {} .test.js | grep -E "\b[$2]" | circleci tests split --split-by=timings )
node apps/remix-ide/ci/splice_tests.js $2 $3
TESTFILES=$(node apps/remix-ide/ci/splice_tests.js $2 $3 | grep -v 'metamask' | circleci tests split --split-by=timings)
for TESTFILE in $TESTFILES; do
    npx nightwatch --config dist/apps/remix-ide-e2e/nightwatch-${1}.js dist/apps/remix-ide-e2e/src/tests/${TESTFILE}.js --env=$1 || npx nightwatch --config dist/apps/remix-ide-e2e/nightwatch-${1}.js dist/apps/remix-ide-e2e/src/tests/${TESTFILE}.js --env=$1 || TEST_EXITCODE=1
done

echo "$TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]
then
  exit 1
fi
