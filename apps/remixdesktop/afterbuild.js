const fs = require('fs');

exports.default = async function afterbuild(context) {
  // do not run when not on macOS or when not on CIRCLECI
  if (process.platform !== 'darwin' || !process.env.CIRCLE_BRANCH) {
    return;
  }

  console.log('AFTER BUILD', context);

  const artifactPaths = context.artifactPaths;
  const newDmgs = artifactPaths.filter((dmg) => dmg.endsWith('.dmg')).map((dmg) => dmg); // Removed unnecessary quotes for consistency

  let existingDmgs = [];
  try {
    // Attempt to read the existing dmgs.json file
    const data = fs.readFileSync('dmgs.json', 'utf8');
    const parsedData = JSON.parse(data);
    existingDmgs = parsedData.dmgs || []; // Ensure existingDmgs is an array
  } catch (error) {
    // If there's an error reading the file (e.g., file does not exist), proceed with an empty array
    console.log('No existing dmgs.json or error reading file, creating new one.');
  }

  // Combine existing and new dmgs, avoiding duplicates
  const combinedDmgs = [...new Set([...existingDmgs, ...newDmgs])];

  // Write/overwrite the dmgs.json with the combined list of dmgs
  fs.writeFileSync('dmgs.json', JSON.stringify({ dmgs: combinedDmgs }, null, 2));
};
