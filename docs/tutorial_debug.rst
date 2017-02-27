Debugging a Transaction
=======================

.. _tutorial-debug:

The goal of this tutorial is to explain how to debug transaction using Remix

Start debugging
---------------

There are two different ways to start debugging, each way correspond to a different use case.

From the Transaction GUI
~~~~~~~~~~~~~~~~~~~~~~~~

We will not explain in detail here how to write / deploy contract.
Let's put a basic contract (replace this one by yours):

.. code-block:: none

    contract Donation {
        address owner;
        event fundMoved(address _to, uint _amount);
        modifier onlyowner { if (msg.sender == owner) _; }
        address[] _giver;
        uint[] _values;
        
        function Donation() {
            owner = msg.sender;
        }
        
        function donate() payable {
            addGiver(msg.value);
        }
    
        function moveFund(address _to, uint _amount) onlyowner {
            uint balance = this.balance;
            uint amount = _amount;
            if (_amount <= this.balance) {
                if (_to.send(this.balance)) {
                    fundMoved(_to, _amount);    
                } else {
                    throw;
                }
            } else {
                throw;
            }
        }
        
        function addGiver(uint _amount) internal {
            _giver.push(msg.sender);
            _values.push(_amount);
        }
    }
    
For the purpose of this tutorial we will run the ``JavaScript VM`` (that's the default mode if don't use Remix with Mist or Metamask).

You could do the same using a backend node.

Let's deploy the contract:

Right panel / Red button ``Create``

.. image:: remix1.png

Then we should call the ``Donate`` function (that will send ether to the contract). 

Let's set the amount of ether:

Right panel / second tab from the left - fill in the ´´value´´ input (´1 ether´ for instance)

.. image:: remix_valueinput.png

Then click on ``Donate``. As we are using the ``JavaScript VM``, everything goes almost instantly.

Remix display also some information related to each transaction result. On the right of each transaction result
you can start debugging the corresponding transaction.

.. image:: remix_startdebugging.png

From the Debugger
~~~~~~~~~~~~~~~~~

Right panel / 5th tab from the left. that's the debugger.

You can start a debug session by providing either a ``transaction hash`` or a ``block number`` and ``transaction index``

.. image:: remix3.png

Click the ``play`` button to start debugging.

Using the debugger
------------------

The debugger allows to see detailed informations about the transaction execution. It uses the editor (left panel) to display the location 
in the source code where the current execution is.

First the transaction panel display basic and simple information about the current transaction.

.. image:: remix_debugtransactioninfo.png

The navigation part contains a slider and buttons used to step over the transaction execution.

From the left to the right: 

step over back, step into back, step into forward, step over forward, jump out (jump out of the current call), jump to the previous breakpoint, jump to the next breakpoint.

.. image:: remix_navigation.png

11 panels will give detailed informations about the execution:

Instructions
~~~~~~~~~~~~

.. image:: remix_debuginstructions.png

This panel will display the bytecode of the current executing contract. the current step is highlighted.

Important note: 
When this panel is hidden, the slider will only enable step that have different source location.
When the panel is diplayed, it will be possible to step over every opcode, even those that refers to the same source location.

Solidity Locals
~~~~~~~~~~~~~~~

.. image:: remix_soliditylocals.png

That panel display local variables associated with the current context.

Solidity State
~~~~~~~~~~~~~~

.. image:: remix_soliditystate.png

That panel display state variables of the current executing contract.

Low level panels
~~~~~~~~~~~~~~~~

These panels display low level informations about the execution:

 - Stack
 - Storages Changes
 - Memory
 - Call Data
 - Call Stack
 - Return Value (only if the current step in a RETURN opcode)
 - Full Storages Changes (only at the end of the execution - display every storage change of every contract)
 
Reverted Transaction
~~~~~~~~~~~~~~~~~~~~

A transaction could be reverted (either because of out of gas exception, Solidity ``throw`` or low level exception).

In that case it is important to be aware of the exception and to locate where the exception is in the source code.

Remix will warn you when the execution throw an exception. The ``warning`` button will jump the execution to the last opcode before the exception happened.

.. image:: remix_executionexception.png

Breakpoints
~~~~~~~~~~~

The two last buttons from the navigation area are used to jump either back to the previous breakpoint or forward to the next breakpoint.

Adding/removing a breakpoint is done like in a normal IDE.

.. image:: remix_breakpoint.png

When a debug session is started, the executing will jump to the first encountered breakpoint.
Important note: 
There are two phases in the EVM execution. the local variables declaration and the proper execution.
It means that saying this contract:

.. code-block:: none

    contract ctr {
        function hid () {
            uint p = 45;
            uint m;
            m = 89;
            uint l = 34;
        }
    }
    
Let's says that breakpoints are set for : 

``uint p = 45;``

``m = 89;``

``uint l = 34;``


clicking on ``Jump to next breakpoint`` will in order jump to :

 ``uint p = 45;``   (declaration of p)
 
 ``uint l = 34;``   (declaration of l)
 
 ``uint p = 45;``   (45 assigned to p)
 
 ``m = 89;``    (89 assigned to m)
 
 ``uint l = 34;``   (34 assigned to l)
 
