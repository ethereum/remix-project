const testFolder = './apps/remix-ide-e2e/src/tests/';
const fs = require('fs');

let url = 'https://binaries.soliditylang.org/wasm/list.json'

const axios = require('axios')

// use axios to download the file
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
        axios({
            method: 'get',
            url: buildurl,
            responseType: 'stream'
        }).then(function (response) {
            // pipe the result stream into a file on disc
            response.data.pipe(fs.createWriteStream(path));
        })

    }
}
)

fs.readdirSync(testFolder).forEach(file => {
    let c = fs.readFileSync(testFolder + file, 'utf8');
    const re = /(?<=soljson).*(?=(.js))/g;
    const soljson = c.match(re);
    if (soljson) {
        for (let i = 0; i < soljson.length; i++) {

            const version = soljson[i];
            if (version && version.indexOf('nightly') > -1) {
                const url = `https://solc-bin.ethereum.org/bin/soljson${version}.js`;
                console.log(url)

                const path = `./dist/apps/remix-ide/assets/js/soljson${version}.js`;
                // use axios to get the file
                axios({
                    method: 'get',
                    url: url,
                    responseType: 'stream'
                }).then(function (response) {
                    // pipe the result stream into a file on disc
                    response.data.pipe(fs.createWriteStream(path));
                })
            }

        }
    }

});
