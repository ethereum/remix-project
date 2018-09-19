Importing Source Files in Solidity
==================================

This tutorial will show you how to import local and external files.

The compilation result will also contain contracts implemented in the
imported files.

For a detailed explanation of the `import` keyword see the
[Solidity documentation](https://solidity.readthedocs.io/en/develop/layout-of-source-files.html?highlight=import#importing-other-source-files)

Importing a local file
----------------------

Other files in Remix can be imported just by specifying their path.
Please use ./ for relative paths to increase portability.

![image](tuto_basicimport.png)

Importing from GitHub
---------------------

It is possible to import files directly from GitHub with URLs like
`https://github.com/<owner>/<repo>/<path to the file>`.

![image](tuto_importgit.png)

Importing from Swarm
--------------------

Files can be imported using all URLs supported by swarm. If you do not
have a swarm node, swarm-gateways.net will be used instead.

![image](tuto_importswarm.png)
