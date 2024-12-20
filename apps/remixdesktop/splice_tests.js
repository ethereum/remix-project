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

// Function to check if a file contains a specific word
function fileContainsWord(filePath, word) {
    const content = fs.readFileSync(filePath, 'utf-8'); // Read file content
    return content.includes(word); // Check if word is in content
}

// Function to filter out files that contain the specified word
function filterFilesByWord(files, word) {
    // Returns only files that do NOT contain the given word
    return files.filter(file => !fileContainsWord(file, word));
}

// Get all test files in the specified directory
const testFiles = getTestFiles(testDirectory);

// Filter out files that contain "@offline"
const filteredFiles = filterFilesByWord(testFiles, '@offline');

// Output the list of filtered files (files that do NOT contain "@offline")
for (let i = 0; i < filteredFiles.length; i++) {
  console.log(path.basename(filteredFiles[i]));
}
