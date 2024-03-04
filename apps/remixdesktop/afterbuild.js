const { spawn } = require('child_process');
exports.default = async function afterbuild(context) {

  // do not run when not on macOS
  if (process.platform !== 'darwin') {
    return;
  }

  console.log('AFTER BUILD', context);

  const artifactPaths = context.artifactPaths
  const dmgs = artifactPaths.filter((dmg) => dmg.endsWith('.dmg')).map((dmg) => `'${dmg}'`)
  console.log(['notarize.sh', ...dmgs]);

  const child = spawn('zsh', ['notarize.sh', ...dmgs], { shell: true });

  child.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  child.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  child.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });

}
