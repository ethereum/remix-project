Running transactions
====================

The Run tab is an important section of Remix. It allows you to send transactions to the current environment.

.. image:: images/remix_runtab.png

Run Setup
---------

The following settings allow you to directly influence the transaction execution:

 - Environment:
    - ``JavaScript VM``: All the transactions will be executed in a sandbox blockchain in the browser. This means nothing will be persisted and a page reload will restart a new blockchain from scratch, the old one will not be saved.

    - ``Injected Provider``: Remix will connect to an injected web3 provider. ``Mist`` and ``Metamask`` are example of providers that inject web3, thus can be used with this option.

    - ``Web3 Provider``: Remix will connect to a remote node. You will need to provide the URL address to the selected provider: geth, parity or any Ethereum client.

 - Account: the list of accounts associated with the current environment (and their associated balances).
 - Gas Limit: the maximum amount of gas that can be set for all the transactions created in Remix.
 - Value: the amount of value for the next created transaction (this value is always reset to 0 after each transaction execution).

 .. image:: images/remix_runtab_example.png

Initiate Instance
-----------------

This section contains the list of compiled contracts and 2 actions:

- ``At Address`` assumes the given address is an instance of the selected contract. It is then possible to interact with an already deployed contract. There's no check at this point, so be careful when using this feature, and be sure you trust the contract at that address.

- ``Create`` send a transaction that deploys the selected contract. When the transaction is mined, the newly created instance will be added (this might take several seconds). Note that if the ``constructor`` has parameters, you need to specify them.

Pending Instances
-----------------

Validating a transaction take several seconds. During this time, the GUI shows it in a pending mode. When transaction is mined the number of pending transactions is updated
and the transaction is added to the log (see :doc:`../terminal`)

Instance List
--------------

This section contains a list of instances to interact with.

Several cases apply:
 - The called function is declared as ``constant`` or ``pure`` in Solidity. The action has a blue background, clicking it does not create a new transaction. Clicking it is not necessary because there are not state changes - but it will update the return value of the function.

 - The called function has no special keywords. The action has a light red background, clicking on does create a new transaction. But this transaction cannot accept any amount of Ether.

 - The called function is declared as ``payable`` in Solidity. The action has a red background, clicking it does create a new transaction and this transaction can accept value.

For more information about Solidity modifier, see `Solidity modifier <http://solidity.readthedocs.io/en/develop/miscellaneous.html?highlight=pure#modifiers>`_ .

If a function requires input parameters, it is required to specify them.
