Remix - Solidity IDE
====================

Remix is an IDE for the smart contract programming language Solidity and has
an integrated debugger and testing environment.

An up to date online version is available at `remix.ethereum.org <http://remix.ethereum.org>`_

This page will host documentation and tutorial about features Remix provides.

Please go to `solidity.readthedocs.io <http://solidity.readthedocs.io>`_ for any information regarding ``Solidity``

Overview
--------

Remix provides an integrated development environment (IDE) for smart contract development. 
It focuses on the development and deployment of Solidity written smart contracts.

Remix is a good solution if you intend to:

 - Develop smart contracts (remix integrates a solidity editor).
 - Debug a smart contract's execution.
 - Access the state and properties of already deployed smart contract.
 - Debug already committed transaction.
 - Analyze solidity code to reduce coding mistakes and to enforce best practices.
 - Together with Mist (or any tool which inject web3), Remix can be used to test and debug a Dapp (see :doc:`../tutorial_mist`)

Developing smart contract requires a deep understanding of the associated Blockchain technology. 

!! Don't use Remix against a production network unless you are completely sure what you are doing !!

This documentation describes all the features remix provides.
The GUI can be separated in 4 parts. Click on one the link to get more information.

 - :doc:`../file_explorer`
 - :doc:`../solidity_editor`
 - :doc:`../terminal`
 - :doc:`../tabs_panel`
    - :doc:`../compile_tab`
    - :doc:`../run_tab`
    - :doc:`../settings_tab`
    - :doc:`../debugger_tab`
    - :doc:`../analysis_tab`
    - :doc:`../support_tab`
    
Quick Start
-----------

(see :doc:`../quickstart_javascriptvm`)

Tutorial
--------

.. toctree::
   :maxdepth: 1
   
   tutorial_remixd_filesystem.rst
   tutorial_mist.rst
   tutorial_debug.rst
   tutorial_import.rst
