Importing Source Files in Solidity
==================================

It is essential to know all many techniques for importing files.

For a tutorial about importing files see this [tutorial](https://github.com/ethereum/remix-workshops/tree/master/loading_via_npm_github_plugin).

For a detailed explanation of the `import` keyword see the
[Solidity documentation](https://solidity.readthedocs.io/en/develop/layout-of-source-files.html?highlight=import#importing-other-source-files)

Here are a some of the main methods of importing a file:

Importing a file from the browser's local storage
-------------------------------------------------

Files in Remix can be imported just by specifying their path. Please use ./ for relative paths to increase portability.
![](images/a-old-tuto_basicimport.png)

Importing a file from your computer's filesystem
-------------------------------------------------

This method uses **remixd** - the remix daemon.  Please go to the [remixd tutorial](remixd.html) for instructions about how to bridge the divide between the browser and your computers filesystem.


Importing from GitHub
---------------------

It is possible to import files directly from GitHub with URLs like
`https://github.com/<owner>/<repo>/<path to the file>`.

![](images/a-old-tuto_importgit.png)

Importing from Swarm
--------------------

Files can be imported using all URLs supported by swarm. If you do not
have a swarm node, then use swarm-gateways.net.

![](images/a-old-tuto_importswarm.png)
