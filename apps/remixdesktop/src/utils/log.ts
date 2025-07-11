import fs from 'fs';

function isDevEnv() {
  return process.env.NODE_ENV === 'development';
}

function hasArg(arg: string) {
  return process.argv.includes(arg);
}

(async () => {
  const verbose = hasArg('--verbose');
  const noLog = hasArg('--no-log');

  if (noLog) {
    console.log = console.info = console.warn = console.error = () => {};
  } else if (isDevEnv()) {
    console.log('Development mode, logs in console.');
  } else {
    // Production: create logs
    try {
      const logFile = fs.createWriteStream('/tmp/remix-desktop.log', { flags: 'w' });
      const errorLogFile = fs.createWriteStream('/tmp/remix-desktop.error.log', { flags: 'w' });

      const writeLog = (...args: any[]) => {
        return args.map(a =>
          typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
        ).join(' ') + '\n';
      };

      if (verbose) {
        const origLog = console.log;
        const origWarn = console.warn;
        const origError = console.error;

        console.log = (...args) => {
          const line = writeLog(...args);
          logFile.write(line);
          origLog(...args);
        };
        console.info = console.log;
        console.warn = (...args) => {
          const line = writeLog(...args);
          logFile.write(line);
          origWarn(...args);
        };
        console.error = (...args) => {
          const line = writeLog(...args);
          logFile.write(line);
          errorLogFile.write(line);
          origError(...args);
        };
      } else {
        console.log = (...args) => {
          logFile.write(writeLog(...args));
        };
        console.info = console.log;
        console.warn = console.log;
        console.error = (...args) => {
          const line = writeLog(...args);
          logFile.write(line);
          errorLogFile.write(line);
        };
      }

      process.on('uncaughtException', (err) => {
        const errorMessage = `[UNCAUGHT EXCEPTION ${new Date().toISOString()}]\n${err.stack || err}\n`;
        logFile.write(errorMessage);
        errorLogFile.write(errorMessage);
      });

      process.on('unhandledRejection', (reason) => {
        const errorMessage = `[UNHANDLED REJECTION ${new Date().toISOString()}]\n${reason}\n`;
        logFile.write(errorMessage);
        errorLogFile.write(errorMessage);
      });
    } catch (err) {
      // If setting up log files fails, suppress console output
      console.log = () => {};
      console.info = () => {};
      console.warn = () => {};
      console.error = () => {};
    }
  }
})();