import { ptyPath } from './prebuild-file-path';

let pty: IUnixNative;

try {
  pty = require(ptyPath || '../build/Release/pty.node');
} catch (outerError) {
  try {
    pty = require(ptyPath ? '../build/Release/pty.node' : '../build/Debug/pty.node');
  } catch (innerError) {
    console.error('innerError', innerError);
    // Re-throw the exception from the Release require if the Debug require fails as well
    throw outerError;
  }
}

export default pty;
