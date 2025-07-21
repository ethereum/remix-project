const os = require('os');
console.log('Electron:', process.versions.electron);
console.log('Node:', process.versions.node);
console.log('ABI:', process.versions.modules)
console.log(os.platform(), os.arch());