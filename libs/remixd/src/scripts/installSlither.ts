const { execSync } = require('child_process') // eslint-disable-line

try {
    const solcVersion = '0.8.15'
    console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: requires Python3.6+ (pip3) to be installed on your system`)
    console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: solc-select will be installed along with Slither to set different solc compiler versions.`)
    console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: checking pip3 availability ...`)
    const pip3OP = execSync('pip3 --version')
    console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: pip3 found: ${pip3OP.toString()}`)
    console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: installing slither...`)
    const slitherOP = execSync('pip3 install slither-analyzer')
    console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: slither installation output: ${slitherOP.toString()}`)
    console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: installing solc-select...`)
    const solcSelectOP = execSync('pip3 install solc-select')
    console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: solc-select installation output: ${solcSelectOP.toString()}`)
    console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: installing solc ${solcVersion}...`)
    const solcInstallOP = execSync(`solc-select install ${solcVersion}`)
    console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: solc installation output: ${solcInstallOP.toString()}`)
    console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: setting solc version to ${solcVersion}...`)
    const solcUseOP = execSync(`solc-select use ${solcVersion}`)
    console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: solc setting installation output: ${solcUseOP.toString()}`)
    console.log('\x1b[32m%s\x1b[0m', `[Slither Installation]: Slither is ready to use!`)
} catch (err) {
    console.log('\x1b[31m%s\x1b[0m', `[Slither Installation]: Error occured: ${err}`)
}
