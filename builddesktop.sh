[ -d apps/remixdesktop/build/remix-ide ] && rm -rf apps/remixdesktop/build/remix-ide
mkdir -p apps/remixdesktop/build
NX_DESKTOP_FROM_DIST=true node --max-old-space-size=4096 node_modules/.bin/nx build remix-ide --configuration=desktop
cp -r dist/apps/remix-ide apps/remixdesktop/build/remix-ide