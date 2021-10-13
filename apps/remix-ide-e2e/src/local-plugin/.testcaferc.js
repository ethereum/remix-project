let os = require("os");

module.exports = {
    skipJsErrors: true,
    browsers: ['chrome  -incognito'],
    screenshots: {
        "path": "/tmp/artifacts",
        "takeOnFails": true,
        "pathPattern": "${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png"
    }
}
