**Q:** There is an error about that the compiler might be in a non-sane state. 
```
error: Uncaught JavaScript exception: RangeError: Maximum call stack size exceeded.
The compiler might be in a non-sane state, please be careful and do not use further compilation data to deploy to mainnet.
It is heavily recommended to use another browser not affected by this issue (Firefox is known to not be affected).
```

**A:** Old versions of solidity compiler had this problem with chrome.
Please change the compiler version in Solidity Plugin to the newer one or use another browser.


**Q:** I am using an Infura endpoint in my app, but when I try to deploy against that endpoint in remix IDE selecting "web3 provider" and putting my endpoint in, it's telling me that it can't connect

**A:** If the endpoint you are using is http, it won't work.


**Q:** Where is deploy button?

**A:** You should activate Deploy & Run module in the Plugin Manager.
Or you can activate everything you need to work with solidity from "Home" -> "Solidity" environment.


**Q:** How to pass a tuple to a public function in Remix?
**A:** Pass it as an array.

**Q:** How to pass a tuple to a public function in Remix?
**A: Pass it as an array.

**Q:** How to input a struct as input to a parameter of a function in the Deploy & Run module?
**A:** For inputting a struct, the easiest way is to use array []

If the struct members have names, using js object should work {name: value, name1: value}

For example, if the struct is:

```
struct r 
{
   string t,
   uint r
}
```

You can use:

["this is a string", 23]

NOTE: - So is there fixed order in Structs - like in mappings?  By not writing the names of the members, we update the values by the order in the array.

Also you need to use ABIEncoderV2 (**where is this?**).





