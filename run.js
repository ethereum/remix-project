const commander = require('commander');
const RemixTests = require('./index.js');

commander.action(function (filename) {
  RemixTests.runTest(filename);
});

if (!process.argv.slice(2).length) {
  console.log("please specify filename");
}

commander.parse(process.argv);

