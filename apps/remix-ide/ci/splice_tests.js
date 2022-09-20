const fs = require('fs')
var exec = require('child_process').exec;
let cmd = `grep -IRiL "@disabled" "dist/apps/remix-ide-e2e/src/tests"`
// get command line arguments
let args = process.argv.slice(2)

const grouplength = args[0] || 10;
const group = args[1] || 0;
exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error.message}`);
      return;
    }
  
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
  
    let files = stdout.split('\n').filter(f => f.includes('.test')).map(f => f.replace('dist/apps/remix-ide-e2e/src/tests/', '')).map(f => f.replace('.js', ''))
    let splitIndex = Math.ceil(files.length / grouplength);
    const parts = []
    for (let i = 0; i < grouplength; i++) {
        parts.push(files.slice(i * splitIndex, (i + 1) * splitIndex))
    }
    console.log(parts[group].join('\n'))
  });
