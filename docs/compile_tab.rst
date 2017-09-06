Compiling contracts
===================

By default Remix triggers a compilation each time the current file is changed or another file is selected.
If the contract has a lot of dependencies and takes long to compile, it is possible to disable `autocompilation`.

After each compilation, a list is updated with all the newly compiled contracts.

`Details` shows up a modal dialog displaying information related to current selected contract.

It is possible to publish contract to Swarm (only non abstract contract can be published). 

Published data contains notably the ``abi`` and solidity source code. 

After a contract is published, metadata information can be accessed using the `bzz` URL located in the details modal dialog ``SWARM LOCATION``.

Compilation Errors and Warning are displayed below the contract section. At each compilation, the static analysis tab builds a report, it is very valuable to address reported issues even if the compiler seems not to complain.
(see :doc:`../analysis_tab`)
 