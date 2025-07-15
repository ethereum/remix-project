const fs = require('fs');
const path = require('path');

// Directory to read files from
const testDirectory = './build-e2e/remixdesktop/test/tests/app/';

// Function to read files in a directory and return their paths
function getTestFiles(directory) {
    return fs.readdirSync(directory)
        .filter(file => file.endsWith('.test.js')) // Get only .test.js files
        .map(file => path.join(directory, file)); // Return full path of each file
}

// Function to filter files by filename containing a specific word
function filterFilesByWord(files, word) {
    if (!word) return files; // Return all files if no filter word provided
    return files.filter(file => path.basename(file).includes(word)); // Return files whose filename contains the word
}

// Get filter from command line argument
const filterArg = process.argv[2] || '';

// Get all test files in the specified directory
const testFiles = getTestFiles(testDirectory);

// Filter files by the filter argument
const filteredFiles = filterFilesByWord(testFiles, filterArg);

// Support for test sharding in CI environments
const shard = parseInt(process.env.SHARD) || 1;
const totalShards = parseInt(process.env.TOTAL_SHARDS) || 1;

// Split tests across shards
let testsToRun = filteredFiles;
if (totalShards > 1) {
  const testsPerShard = Math.ceil(filteredFiles.length / totalShards);
  const startIndex = (shard - 1) * testsPerShard;
  const endIndex = Math.min(startIndex + testsPerShard, filteredFiles.length);
  testsToRun = filteredFiles.slice(startIndex, endIndex);
}

// Output the list of filtered files
//console.log('Files without "@offline":', filteredFiles);
for (let i = 0; i < testsToRun.length; i++) {
  console.log(path.basename(testsToRun[i]));
}
