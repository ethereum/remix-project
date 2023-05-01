const testFolder = './apps/remix-ide-e2e/src/tests/';
const fs = require('fs');

let url = 'https://binaries.soliditylang.org/wasm/list.json'

const axios = require('axios')

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
