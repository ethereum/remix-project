#!/bin/bash

SAUCECONNECT_URL="http://saucelabs.com/downloads/sc-4.3.16-linux.tar.gz"
SAUCECONNECT_USERNAME="yann300"
SAUCECONNECT_ACCESSKEY="e6f430f2-daa0-48bb-90fd-8bee20f429eb"
SAUCECONNECT_JOBIDENTIFIER="remix_tests_${TRAVIS_JOB_NUMBER}"
SAUCECONNECT_READYFILE="sc.ready"

npm run build
npm run serve &

wget $SAUCECONNECT_URL
tar -zxvf sc-4.3.16-linux.tar.gz
./sc-4.3.16-linux/bin/sc -u $SAUCECONNECT_USERNAME -k $SAUCECONNECT_ACCESSKEY -i $SAUCECONNECT_JOBIDENTIFIER --readyfile $SAUCECONNECT_READYFILE &
while [ ! -f $SAUCECONNECT_READYFILE ]; do
  sleep .5
done

#npm run nightwatch_remote_firefox
#npm run nightwatch_remote_chrome
#npm run nightwatch_remote_safari
npm run nightwatch_remote_ie

curl "https://saucelabs.com/rest/v1/${SAUCECONNECT_USERNAME}/tunnels/${SAUCECONNECT_JOBIDENTIFIER}" -u "${SAUCECONNECT_USERNAME}:${SAUCECONNECT_ACCESSKEY}" -X DELETE
