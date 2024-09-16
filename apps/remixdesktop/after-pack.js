const fs = require('fs-extra');
const path = require('path');

exports.default = async function (context) {
    const resourcesPath = context.appOutDir;
    console.log('resourcesPath', resourcesPath);
    console.log('context outdir', context.appOutDir);
    // Copy the node-pty module to the app folder
    await fs.copy(
        path.join(context.appOutDir, 'node_modules', 'node-pty'),
        path.join(resourcesPath, 'node_modules', 'node-pty')
    );
};
