const fs = require('fs');
var child_process = require('child_process');
const { exit } = require('process');

const child = child_process.spawnSync('grep -r --include="*.json" --include="*.ts" --include="*.tsx" "+commit" apps/**/* libs/**/*', [], { encoding: 'utf8', cwd: process.cwd(), shell: true });

if (child.error) {
  console.log("ERROR: ", child);
  exit(1);
}


let soljson =[];

const quotedVersionsRegex = /['"v]\d*\.\d*\.\d*\+commit\.[\d\w]*/g;
let quotedVersionsRegexMatch = child.stdout.match(quotedVersionsRegex)
if(quotedVersionsRegexMatch){
  let soljson2 = quotedVersionsRegexMatch.map((item) => item.replace('\'', 'v').replace('"', 'v'))
  console.log('non nightly soljson versions found: ', soljson2);
  if(soljson2) soljson = soljson.concat(soljson2);
}


const nightlyVersionsRegex = /\d*\.\d*\.\d-nightly.*\+commit\.[\d\w]*/g
const nightlyVersionsRegexMatch = child.stdout.match(nightlyVersionsRegex)
if(nightlyVersionsRegexMatch){
  let soljson3 = nightlyVersionsRegexMatch.map((item) => 'v' + item);
  console.log('nightly soljson versions found: ', soljson3);
  if(soljson3) soljson = soljson.concat(soljson3);
}

const downloadSolidity = async () => {
if (soljson) {
  // filter out duplicates
  soljson = soljson.filter((item, index) => soljson.indexOf(item) === index);

  // manually add some versions
  soljson.push('v0.7.6+commit.7338295f');
    
  console.log('soljson versions found: ', soljson, soljson.length);
    
  // Download in parallel batches to speed up the process
  const downloadPromises = [];
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
        fs.mkdirSync(dir, { recursive: true });
      }

      const path = `./dist/apps/remix-ide/assets/js/soljson/soljson-${version}.js`;
      // check if the file exists
      const exists = fs.existsSync(path);
      if (!exists) {
        console.log('Downloading:', url)
        const downloadPromise = new Promise((resolve, reject) => {
          try {
            // use curl to download the file with retry and timeout
            child_process.exec(`curl --retry 3 --retry-delay 2 --max-time 30 -o ${path} ${url}`, { encoding: 'utf8', cwd: process.cwd(), shell: true }, (error, stdout, stderr) => {
              if (error) {
                console.log('Failed to download soljson' + version + ' from ' + url + ': ' + error.message)
                resolve(); // Don't reject, just continue with other downloads
              } else {
                console.log(`Successfully downloaded ${version}`)
                resolve();
              }
            })
          } catch (e) {
            console.log('Failed to download soljson' + version + ' from ' + url + ': ' + e.message)
            resolve(); // Don't reject, just continue with other downloads
          }
        });
        downloadPromises.push(downloadPromise);
      }
    }
  }
   // Wait for all downloads to complete
  await Promise.all(downloadPromises);

}
}

downloadSolidity();

