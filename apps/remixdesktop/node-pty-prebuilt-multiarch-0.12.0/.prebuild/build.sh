#!/bin/sh

. /etc/os-release

cd /node-pty
# rm -rf node_modules
echo
echo "Building for $(uname -m)... ->" $*

echo
#npm config set unsafe-perm true
#npm cache clean
#npm ci --ignore-scripts --no-bin-links
npm ci --ignore-scripts
# https://github.com/microsoft/vscode/blob/c23f0305dbf82b2319b198f4dbf3c5d5bc522f15/build/azure-pipelines/linux/product-build-linux-client.yml#L113-L125

echo

# node-gyp@9.0.0 shipped with node@16.15.0 starts using config.gypi
# from the custom headers path if dist-url option was set, instead of
# using the config value from the process. Electron builds with pointer compression
# enabled for x64 and arm64, but incorrectly ships a single copy of config.gypi
# with v8_enable_pointer_compression option always set for all target architectures.
# We use the force_process_config option to use the config.gypi from the
# nodejs process executing npm for 32-bit architectures.

# if [ "$QEMU_ARCH" = "arm"  ] || [ "$QEMU_ARCH" = "i386" ]; then
#   export npm_config_force_process_config="true"
# fi

#node .prebuild/build.js
env JOBS=max node $*
echo
#env JOBS=max node .prebuild/prebuild.js -t 19.0.0 -t 20.0.0 -t 21.0.0 -t 22.0.0
#env JOBS=max node .prebuild/prebuildify.js -t 19.0.0 -t 20.0.0 -t 21.0.0 -t 22.0.0

#env JOBS=max node .prebuild/prebuild.js -t 10.0.0 -t 11.0.0 -t 12.0.0 -t 13.0.0 -t 14.0.0 -t 15.0.0 -t 16.0.0 -t 17.0.1 -t 18.0.0
#env JOBS=max node .prebuild/prebuildify.js -t 10.0.0 -t 11.0.0 -t 12.0.0 -t 13.0.0 -t 14.0.0 -t 15.0.0 -t 16.0.0 -t 17.0.1 -t 18.0.0
#env JOBS=max node .prebuild/electron.js -t 5.0.0 -t 6.0.0 -t 7.0.0 -t 8.0.0 -t 9.0.0 -t 10.0.0 -t 11.0.0 -t 12.0.0 -t 13.0.0 -t 14.0.0 -t 15.0.0 -t 16.0.0 -t 17.0.0 -t 18.0.0
