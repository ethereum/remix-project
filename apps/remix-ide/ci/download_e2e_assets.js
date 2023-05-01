const testFolder = './apps/remix-ide-e2e/src/tests/';
const fs = require('fs');
var child_process = require('child_process');

let url = 'https://binaries.soliditylang.org/wasm/list.json'

const axios = require('axios');
const { exit } = require('process');

// use axios to download the file
/*
axios({
    url: url,
    method: 'GET',
}).then((response) => {

    let info = response.data;
    info.builds = info.builds.filter(build => build.path.indexOf('nightly') === -1)
    for (let build of info.builds) {

        const buildurl = `https://solc-bin.ethereum.org/wasm/${build.path}`;
        console.log(buildurl)

        const path = `./dist/apps/remix-ide/assets/js/${build.path}`;
        // use axios to get the file
        try {
            axios({
                method: 'get',
                url: buildurl,
            }).then(function (response) {
                fs.writeFile(path, response.data, function (err) {
                    if (err) {
                        console.log(err);
                    }
                })
            })
        } catch (e) {
            console.log('Failed to download ' + build.path + ' from ' + buildurl)
        }

    }
}
)
*/



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
            console.log(url)
            const path = `./dist/apps/remix-ide/assets/js/soljson${version}.js`;
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

/*

fs.readdirSync(testFolder).forEach(file => {
    let c = fs.readFileSync(testFolder + file, 'utf8');
    const re = /(?<=soljson).*(?=(.js))/g;
    const soljson = c.match(re);
    if (soljson) {
        console.log(soljson)
        for (let i = 0; i < soljson.length; i++) {

            const version = soljson[i];
            if (version) {
                const url = `https://solc-bin.ethereum.org/bin/soljson${version}.js`;
                console.log(url)

                const path = `./dist/apps/remix-ide/assets/js/soljson${version}.js`;
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

});

*/
