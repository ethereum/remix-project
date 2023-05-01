const fs = require('fs');
var child_process = require('child_process');
const { exit } = require('process');

var child = child_process.spawnSync('grep', ['-ir', '[0-9]+commit', 'libs/**/*', 'apps/**/*', '--include', '*.ts', '--include', '*.tsx'], { encoding: 'utf8', cwd: process.cwd(), shell: true });

if (child.error) {
    console.log("ERROR: ", child);
    exit(1);
}

const nonNightlyRegex = /v\d*\.\d*\.\d*\+commit\.[\d\w]*/g;

let soljson = child.stdout.match(nonNightlyRegex);
console.log('non nightly soljson versions found: ', soljson);

const quotedVersionsRegex = /'\d*\.\d*\.\d*\+commit\.[\d\w]*/g;
let soljson2 = child.stdout.match(quotedVersionsRegex).map((item) => item.replace('\'', 'v'));
console.log('quoted soljson versions found: ', soljson2);

const nightlyVersionsRegex = /\d*\.\d*\.\d-nightly.*\+commit\.[\d\w]*/g
let soljson3 = child.stdout.match(nightlyVersionsRegex).map((item) => 'v' + item);
console.log('nightly soljson versions found: ', soljson3);

// merge the three arrays
soljson = soljson.concat(soljson2);
soljson = soljson.concat(soljson3);

console.log('soljson versions found: ', soljson);



if (soljson) {
    // filter out duplicates
    soljson = soljson.filter((item, index) => soljson.indexOf(item) === index);


    // manually add some versions

    soljson.push('v0.7.6+commit.7338295f');
    soljson.push('v0.5.17+commit.d19bba13');

    console.log('soljson versions found: ', soljson);
    
    for (let i = 0; i < soljson.length; i++) {
        const version = soljson[i];
        if (version) {
            let url = ''

            // if nightly
            if (version.includes('nightly')) {
                url = `https://binaries.soliditylang.org/bin/soljson-${version}.js`;
            }else{
                url = `https://binaries.soliditylang.org/wasm/soljson-${version}.js`;
            }

            const dir = './dist/apps/remix-ide/assets/js/soljson';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }

            const path = `./dist/apps/remix-ide/assets/js/soljson/soljson-${version}.js`;
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

