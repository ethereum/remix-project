import { erc20 } from '@openzeppelin/wizard';

export default async (opts) => {
  
  const filesObj = {
    // @ts-ignore
    'contracts/EmptyAccount.sol': (await import('!!raw-loader!./contracts/EmptyAccount.sol')).default,
    // @ts-ignore
    'contracts/Simple7702Account.sol': (await import('!!raw-loader!./contracts/Simple7702Account.sol')).default,
    // @ts-ignore
    'README.md': (await import('raw-loader!./README.md')).default
  } 
  return filesObj
}
