#!/usr/bin/env bash

set -e

# if $1 is chrome
if [ "$1" == "chrome" ]; then
# 1) Start ChromeDriver in the background
/usr/local/bin/chromedriver \
  --port=9515 \
  --host=127.0.0.1 \
  --silent > driver.log 2>&1 &


# Save its PID so you can kill it later if needed
echo $! > chromedriver.pid

# 2) Wait until ChromeDriver is actually listening
while ! curl -s http://127.0.0.1:9515/status >/dev/null; do
  sleep 0.2
done

echo "🚀 ChromeDriver is up on 127.0.0.1:9515"

fi

BUILD_ID=${CIRCLE_BUILD_NUM:-${TRAVIS_JOB_NUMBER}}
echo "$BUILD_ID"
TEST_EXITCODE=0

npx http-server -p 9999 ./dist/apps/$1 &
npx ganache &
npx http-server -p 9090 --cors='*' ./node_modules &
yarn run serve:production &

sleep 5

TESTFILES=$(grep -IRiL "\'@disabled\': \?true" "dist/apps/remix-ide-e2e/src/tests" | grep $1 | sort | circleci tests split )
for TESTFILE in $TESTFILES; do
    npx nightwatch --config dist/apps/remix-ide-e2e/nightwatch-chrome.js $TESTFILE --env=chrome  || TEST_EXITCODE=1
done

echo "$TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]
then
  exit 1
fi
