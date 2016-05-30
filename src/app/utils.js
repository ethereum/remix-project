var SOL_CACHE_FILE_PREFIX = 'sol-cache-file-';

function getCacheFilePrefix() {
  return SOL_CACHE_FILE_PREFIX;
}

function fileKey( name ) {
  return getCacheFilePrefix() + name;
}

function fileNameFromKey(key) {
  return key.replace( getCacheFilePrefix(), '' );
}

module.exports = {
  getCacheFilePrefix: getCacheFilePrefix,
  fileKey: fileKey,
  fileNameFromKey: fileNameFromKey
};
