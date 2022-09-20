const testFolder = './apps/remix-ide-e2e/src/tests/';
const fs = require('fs');

let url = 'https://binaries.soliditylang.org/bin/list.json'
let request = require('request');
request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        let info = JSON.parse(body);
        info.builds = info.builds.filter(build => build.path.indexOf('nightly') === -1)
        for (let build of info.builds) {

            const buildurl = `https://solc-bin.ethereum.org/bin/${build.path}`;
            console.log(buildurl)

            const path = `./dist/apps/remix-ide/assets/js/${build.path}`;
            const file = fs.createWriteStream(path);
            try {
                require('https').get(buildurl, function (response) {
                    response.pipe(file);
                });
            } catch (e) {
                console.log('error', buildurl)
            }

        }
    }
})

fs.readdirSync(testFolder).forEach(file => {
    let c = fs.readFileSync(testFolder + file, 'utf8');
    const re = /(?<=soljson).*(?=(.js))/g;
    const soljson = c.match(re);
    if (soljson) {
        for (let i = 0; i < soljson.length; i++) {

            const version = soljson[i];
            if(version && version.indexOf('nightly') > -1) {
                const url = `https://solc-bin.ethereum.org/bin/soljson${version}.js`;
                console.log(url)

                const path = `./dist/apps/remix-ide/assets/js/soljson${version}.js`;
                const file = fs.createWriteStream(path);
                require('https').get(url, function (response) {
                    response.pipe(file);
                });
            }

        }
    }

});
