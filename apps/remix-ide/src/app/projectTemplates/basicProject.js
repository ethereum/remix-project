export const basicProject = {
    'contracts/contract.sol': `contract c {
        function transfer () public {}
        function getValue () public view returns (uint) { return 1; }
    }`,
    'scripts/deploy.js': `(async () => {
        try {
          // contract needs to be compiled first (to generate metadata)
          const metadata = JSON.parse(await remix.call('fileManager', 'getFile', 'browser/artifacts/c.json'))
          const abi = metadata.abi
          const bytecode = metadata.data.bytecode.object
          // the variable web3Provider is a remix global variable object
          const signer = (new ethers.providers.Web3Provider(web3Provider)).getSigner()
          
          let factory = new ethers.ContractFactory(abi, bytecode, signer);
          let contract = await factory.deploy();
          console.log(contract.address);
          console.log(contract.deployTransaction.hash);
          await contract.deployed()
          console.log('contract deployed')
        } catch (e) {
          console.log(e.message)
        }
    })()`,
    'scripts/transact.js': `(async () => {
        try {
            const  CONTRACT_ADDR = 'CONTRACT_ADDRESS'            
                      
            // contract needs to be compiled first (to generate metadata)
            const metadata = JSON.parse(await remix.call('fileManager', 'getFile', 'browser/artifacts/c.json'))
            const abi = metadata.abi
            // the variable web3Provider is a remix global variable object
            const provider = (new ethers.providers.Web3Provider(web3Provider))
            const signer = provider.getSigner()
            let contract = new ethers.Contract(CONTRACT_ADDR, abi, signer)
    
            const txn = await contract.transfer()
            
            console.log('sending')
            console.log(txn)
            await txn.wait()
            console.log('done')
        } catch (e) {
            console.log(e.message)
        }
    })()`,
        'scripts/call.js': `(async () => {
            try {
                const  CONTRACT_ADDR = 'CONTRACT_ADDRESS'            
                          
                // contract needs to be compiled first (to generate metadata)
                const metadata = JSON.parse(await remix.call('fileManager', 'getFile', 'browser/artifacts/c.json'))
                const abi = metadata.abi
                // the variable web3Provider is a remix global variable object
                const provider = (new ethers.providers.Web3Provider(web3Provider))
                const signer = provider.getSigner()
                let contract = new ethers.Contract(CONTRACT_ADDR, abi, signer);
        
                let currentValue = await contract.getValue();
        
                console.log(currentValue)
            } catch (e) {
                console.log(e.message)
            }
        })()`,
    'tests/contract_test.sol': `pragma solidity >=0.4.22 <0.8.0;
    import "remix_tests.sol"; // this import is automatically injected by Remix.
    import "remix_accounts.sol";
    // Import here the file to test.
    import "../contracts/contract.sol";
    
    // File name has to end with '_test.sol', this file can contain more than one testSuite contracts
    contract testSuite {
        c testTarget;
        /// 'beforeAll' runs before all other tests
        /// More special functions are: 'beforeEach', 'beforeAll', 'afterEach' & 'afterAll'
        function beforeAll() public {
            testTarget = new c();
            // Here should instantiate tested contract
            Assert.equal(uint(1), uint(1), "1 should be equal to 1");
        }
    
        function checkSuccess() public {
            // Use 'Assert' to test the contract, 
            // See documentation: https://remix-ide.readthedocs.io/en/latest/assert_library.html
            Assert.equal(uint(2), uint(2), "2 should be equal to 2");
            Assert.notEqual(uint(2), uint(3), "2 should not be equal to 3");
        }
    
        function checkSuccess2() public pure returns (bool) {
            // Use the return value (true or false) to test the contract
            return true;
        }
        
        function checkFailure() public {
            Assert.equal(uint(1), uint(2), "1 is not equal to 2");
        }
    
        /// Custom Transaction Context
        /// See more: https://remix-ide.readthedocs.io/en/latest/unittesting.html#customization
        /// #sender: account-1
        /// #value: 100
        function checkSenderAndValue() public payable {
            // account index varies 0-9, value is in wei
            Assert.equal(msg.sender, TestsAccounts.getAccount(1), "Invalid sender");
            Assert.equal(msg.value, 100, "Invalid value");
        }
    }`

}