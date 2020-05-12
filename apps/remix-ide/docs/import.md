Importing Source Files in Solidity
==================================

There are multiple techniques for importing files into Remix.

For a tutorial about importing files click [here](https://github.com/ethereum/remix-workshops/tree/master/LoadingContent).  You can also find this tutorial in the Remix Workshops plugin.

For a detailed explanation of the `import` keyword see the
[Solidity documentation](https://solidity.readthedocs.io/en/develop/layout-of-source-files.html?highlight=import#importing-other-source-files)

Here are a some of the main methods of importing a file:

Importing a file from the browser's local storage
-------------------------------------------------

Files in Remix can be imported with the `import` key word with the path to the file. Use ```./``` for relative paths to increase portability.
```
pragma solidity >=0.4.22 <0.6.0;

import "./ballot.sol";
```


Importing a file from your computer's filesystem
-------------------------------------------------

This method uses **remixd** - the remix daemon.  Please go to the [remixd tutorial](remixd.html) for instructions about how to bridge the divide between the browser and your computers filesystem.


Importing from GitHub
---------------------

It is possible to import files directly from GitHub.  You should specify the release tag (where available), otherwise you will get the latest code in the master branch.  For OpenZeppelin Contracts you should only use code published in an official release, the example below imports from OpenZeppelin Contracts v2.5.0.

```
pragma solidity >=0.4.22 <0.6.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.0/contracts/math/SafeMath.sol";

```

Importing from Swarm
--------------------

Files can be imported using all URLs supported by swarm. 
If you do not have a swarm node, then use swarm-gateways.net.

```
import 'bzz-raw://5766400e5d6d822f2029b827331b354c41e0b61f73440851dd0d06f603dd91e5';
```

Importing from IPFS
--------------------

Files can be imported from IPFS. 

```
import 'ipfs://Qmdyq9ZmWcaryd1mgGZ4PttRNctLGUSAMpPqufsk6uRMKh';
```

Importing from the console
--------------------------

You can also use a remix command remix.loadurl('<the_url>')in the console. You should specify the release tag (where available), otherwise you will get the latest code in the master branch. For OpenZeppelin Contracts you should only use code published in an official release, the example below imports from OpenZeppelin Contracts v2.5.0.

```
remix.loadurl('https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.0/contracts/math/SafeMath.sol')
```

Notice that this will create a `github` folder in the file explorer.  To load a file in the `github` folder, you would use a command like this:

```
import "github/OpenZeppelin/openzeppelin-contracts/contracts/math/SafeMath.sol";
```
