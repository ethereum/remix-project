**Q: compiler might be in a non-sane state**
``error: "Uncaught JavaScript exception: RangeError: Maximum call stack size exceeded.
The compiler might be in a non-sane state, please be careful and do not use further compilation data to deploy to mainnet.
It is heavily recommended to use another browser not affected by this issue (Firefox is known to not be affected)."``

**A: Old versions of solidity compiler had this problem with chrome.**
Please change the compiler version in Solidity Plugin to the newer one or use another browser.
