const transactionDetailsLinks = {
    Main: 'https://www.etherscan.io/tx/',
    Rinkeby: 'https://rinkeby.etherscan.io/tx/',
    Ropsten: 'https://ropsten.etherscan.io/tx/',
    Kovan: 'https://kovan.etherscan.io/tx/',
    Goerli: 'https://goerli.etherscan.io/tx/'
  }
  
  export function etherScanLink (network: string, hash: string): string {
    if (transactionDetailsLinks[network]) {
      return transactionDetailsLinks[network] + hash
    }
  }