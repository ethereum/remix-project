const isDevPromise = import('electron-is-dev').then(module => module.default).catch(() => false);

const isDev = async () => {
    return (await isDevPromise || process.env.NODE_ENV === 'development' || process.argv.includes('--debug')) && !process.argv.includes('--no-log');
};


(async () => {
    if (!await isDev()) {
        console.log('Production mode, logs are disabled. Eneble with --debug');
        console.log = console.warn = console.error = console.info = () => { };
    }
})();

