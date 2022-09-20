const testFolder = './apps/remix-ide-e2e/src/tests/';
const fs = require('fs');



fs.readdirSync(testFolder).forEach(file => {
    let c = fs.readFileSync(testFolder + file, 'utf8');
    const re = /(?<=soljson).*(?=(.js))/g;
    const soljson = c.match(re);
    if (soljson) {
        for (let i = 0; i < soljson.length; i++) {

            const version = soljson[i];
            if(version) {
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