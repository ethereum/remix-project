Compiler (Solidity)
===================

Clicking the Solidity icon in the icon panel brings you to the Solidty Compiler.

Compiling is triggered when you click the compile button ( **D. in image below**). If you want the file to be compiled each time the file is saved or when another file is selected - check the auto compile checkbox ( **E. in image below**).

Since the Solidity version `0.5.7`, it is possible to compile `Yul` files. Please read the ([solidity documentation about Yul](https://solidity.readthedocs.io/en/latest/yul.html)) which contain some code examples.
You can use the language dropdown ( **B. in image below**) to switch the language. **This dropdown list is only available for versions greater than or equal to `0.5.7`.**

The fork selection dropdown list ( **C. in image below**) allows to compile code against a specific ethereum hard fork. 
The `compiler default` corresponds to the default hard fork used by a specific version. Please go to "Compilation Details" ( **G. in image below**) in the settings of `Metadata` section to see the harfork name used for the current compilation.

If the contract has a lot of dependencies it can take a while to compile - so you use autocompilation at your discretion.

![](images/a-sol-compiler.png)

After each compilation, a list is updated with all newly compiled
contracts.  A compiled contract can be selected with the Contract pulldown menu ( **F. in the image**).  Multiple contracts are compiled when one contract imports other contracts.  Selecting a contract will show information about that one.

When the "Compilation Details" button is clicked ( **G. in image**), a modal opens displaying detailed information about the current selected contract.

For those writing your own custom solidity compiler, you can import that by clicking the **+** button (**X. in the image**) to open a modal where you can input the url of the compiler to be loaded.

From the Solidity Compiler module you can also publish your contract to Swarm (only non
abstract contracts can be published) & IPFS.

Published data notably contains the `abi` and the solidity source code.

After a contract is published, you can find its metadata information
using the bzz URL located in the details modal dialog `SWARM LOCATION`.

Compilation Errors and Warning are displayed below the contract section.
At each compilation, the static analysis tab builds a report. It is important to address reported issues even if the compiler doesn't complain. ([see more](static_analysis.html))
