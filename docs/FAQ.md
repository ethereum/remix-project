FAQ
===

### Solidity compiler

**Q: Error: compiler might be in a non-sane state**
```
error: "Uncaught JavaScript exception: RangeError: Maximum call stack size exceeded.
The compiler might be in a non-sane state, please be careful and do not use further compilation data to deploy to mainnet.
It is heavily recommended to use another browser not affected by this issue (Firefox is known to not be affected)."
```

**A:** Old versions of solidity compiler had this problem with chrome.
Please change the compiler version in Solidity Plugin to the newer one or use another browser.

**Q:** I’m getting an issue with Maximum call stack exceed and various other errors, can't compile.

**A:**  Try a different browser or a newer solidity compiler version.

**Q:** How to verify a contract that imports other contracts?

**A:**  The verification tool does not recursively go through the import statments in a contract.  So can only verify a 'flattened' contract.  

There is a plugin called `Flattener` which will stuff all the original code and the imported code into a single file.

### Deploy & Run

**Q:** I am using an Infura endpoint in my app, but when I try to deploy against that endpoint in remix IDE selecting "web3 provider" and putting my endpoint in, it's telling me that it can't connect

**A:** If the endpoint you are using is http, it won't work.

**Q:** Where is deploy button?

**A:** Its in the Deploy & Run module. If you haven't activated that module, you should do that by clicking Deploy & Run module in the Plugin Manager.
You could also activate everything you need to work with solidity on the landing page ( click the remix logo at the top left for the screen) and click the "Solidity" button in the environment section.

**Q:** How to pass a tuple to a public function in Remix?

**A:** Pass it as an array [].

**Q:** How to input a struct as input to a parameter of a function in the Deploy & Run module?

**A:** For inputting a struct, just like a tuple, pass it in as an array [].  Also you need to put in the line:

`pragma experimental ABIEncoderV2;` at the top of the solidity file.

For example, here's a solidity file with a struct is an input parameter.

```
pragma solidity >=0.4.22 <0.6.0;
pragma experimental ABIEncoderV2;

contract daPeeps {
    struct Peep {uint a; uint b;} // declaration of Peep type
    Peep peep; //declaration of an object of Peep type

    constructor () public
    {
        peep.a = 0; // definition/initialisation of object
        peep.b = 0; //
    }

    function initPeepToPeep(Peep memory i) public payable {
        peep.a = i.a;
        peep.b = i.b;
    }
    function setPeep(uint a, uint b) public payable {
        peep.a = a;
        peep.b = b;
    }

    function getPeep() public view returns(Peep memory)
    {
        return peep;
    }
}
```

The input of initPeepToPeeps takes a struct.  If you input
`[1,2]` the transaction will go through.


### General

**Q:** Where do plugin developers go with their questions?

**A:** The Gitter Remix plugin developers room https://gitter.im/ethereum/remix-dev-plugin
