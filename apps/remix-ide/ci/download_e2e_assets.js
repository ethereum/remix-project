
const fs = require('fs');
var child_process = require('child_process');
const axios = require('axios');
const { exit } = require('process');

var child = child_process.spawnSync('grep', ['-ir', '"\soljson-v0"', 'libs/*', 'apps/*'], { encoding: 'utf8', cwd: process.cwd(), shell: true });

if (child.error) {
    console.log("ERROR: ", child);
    exit(1);
}


const re = /(?<=soljson).*(?=(.js))/g;
const soljson = child.stdout.match(re);
if (soljson) {
    for (let i = 0; i < soljson.length; i++) {
        const version = soljson[i];
        if (version) {
            let url = ''

            url = `https://binaries.soliditylang.org/bin/soljson${version}.js`;

            const path = `./dist/apps/remix-ide/assets/js/soljson${version}.js`;
            // check if the file exists
            const exists = fs.existsSync(path);
            if (!exists) {
                console.log(url)
                // use axios to get the file
                try {
                    axios({
                        method: 'get',
                        url: url,
                    }).then(function (response) {
                        fs.writeFile(path, response.data, function (err) {
                            if (err) {
                                console.log(err);
                            }
                        })
                    })
                } catch (e) {
                    console.log('Failed to download soljson' + version + ' from ' + url)
                }
            }


        }

    }
}

