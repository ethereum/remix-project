
const fs = require('fs');
var child_process = require('child_process');
const { exit } = require('process');

var child = child_process.spawnSync('grep', ['-ir', '[0-9]+commit', 'libs/**/*', 'apps/**/*', '--include', '\*.ts'], { encoding: 'utf8', cwd: process.cwd(), shell: true });

if (child.error) {
    console.log("ERROR: ", child);
    exit(1);
}


const re = /(?<=soljson).*(?=(.js))/g;
let soljson = child.stdout.match(re);
if (soljson) {
    // filter out duplicates
    soljson = soljson.filter((item, index) => soljson.indexOf(item) === index);
    console.log('soljson versions found: ', soljson);

    // manually add some versions
    soljson.push('soljson-v0.6.8+commit.0bbfe453.js');
    soljson.push('soljson-v0.6.0+commit.26b70077.js');
    
    for (let i = 0; i < soljson.length; i++) {
        const version = soljson[i];
        if (version) {
            let url = ''

            // if nightly
            if (version.includes('nightly')) {
                url = `https://binaries.soliditylang.org/bin/soljson${version}.js`;
            }else{
                url = `https://binaries.soliditylang.org/wasm/soljson${version}.js`;
            }

            const dir = './dist/apps/remix-ide/assets/js/soljson';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }

            const path = `./dist/apps/remix-ide/assets/js/soljson/soljson${version}.js`;
            // check if the file exists
            const exists = fs.existsSync(path);
            if (!exists) {
                console.log('URL:', url)
                try {
                    // use curl to download the file
                    child_process.exec(`curl -o ${path} ${url}`, { encoding: 'utf8', cwd: process.cwd(), shell: true })
                } catch (e) {
                    console.log('Failed to download soljson' + version + ' from ' + url)
                }
            }


        }
       
    } 

}

