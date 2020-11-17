/* eslint-disable */
// TEST_SCRIPT='node_modules/.bin/nightwatch --config dist/apps/remix-ide-e2e/nightwatch.js'; if [ {args.env} != undefined ]; then TEST_SCRIPT=${TEST_SCRIPT}' --env {args.env}'; else TEST_SCRIPT=${TEST_SCRIPT}' --env chrome'; fi; if [ {args.filePath} != undefined ]; then TEST_SCRIPT=${TEST_SCRIPT}' {args.filePath}'; fi; eval $TEST_SCRIPT;
const commands = process.argv
let filePath = '', env = ''

commands.forEach(val => {
    if (val.indexOf('--filePath') !== -1) filePath = val.split('=')[1]
    else if (val.indexOf('--env') !== -1) env = val.split('=')[1]
})