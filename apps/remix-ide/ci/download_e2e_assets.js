
const fs = require('fs');
var child_process = require('child_process');
const axios = require('axios');
const { exit } = require('process');

var child = child_process.spawnSync('grep', ['-ir', '"\soljson-v[0-9]"', 'libs/*', 'apps/*'], { encoding: 'utf8', cwd: process.cwd(), shell: true });

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

            const dir = './dist/apps/remix-ide/assets/js/soljson';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }

            const path = `./dist/apps/remix-ide/assets/js/soljson/soljson${version}.js`;
            // check if the file exists
            const exists = fs.existsSync(path);
            if (!exists) {
                console.log(url)
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
                    }).catch(function (error) {
                        console.log(error);
                    })
                } catch (e) {
                    console.log('Failed to download soljson' + version + ' from ' + url)
                }
            }


        }

    }
}

