const { ptyPath } = require('../lib/prebuild-file-path');

if (ptyPath) {
  console.log('Prebuild binary exists:', ptyPath);
  try {
    require(ptyPath);
  } catch (e) {
    console.error('Prebuild binary failed test.');
    process.exit(1);
  }
  process.exit(0);
} else {
  console.error('Prebuild binary missing for platform.');
  process.exit(1);
}