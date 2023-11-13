// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.4;
import {ISemaphore} from "semaphore/contracts/interfaces/ISemaphore.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {IHackerGroup} from "contracts/IHackerGroup.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {MockRouter} from "contracts/Router.sol";
import {LINK} from "contracts/Link.sol";

contract HackerClient is OwnerIsCreator {
    uint64 destinationChain; // The chain selector of the destination chain.
    uint64 sourceChain;
    IHackerGroup hackergroup;

    LINK linkToken;
    MockRouter router;

    // Event emitted when a message is sent to another chain.
    event MessageSent(
        bytes32 indexed messageId, // The unique ID of the CCIP message.
        uint64 indexed destinationChainSelector, // The chain selector of the destination chain.
        address receiver, // The address of the receiver on the destination chain.
        bytes text, // The text being sent.
        address feeToken, // the token address used to pay CCIP fees.
        uint256 fees // The fees paid for sending the CCIP message.
    );

    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees); // Used to make sure contract has enough balance.

    constructor(
        uint64 _destinationChainSelector,
        uint64 _sourceChain,
        address _hackergroup
    ) {
        destinationChain = _destinationChainSelector;
        sourceChain = _sourceChain;
        router = new MockRouter();
        linkToken = new LINK();
        hackergroup = IHackerGroup(_hackergroup); // IHackerGroup(_hackergroup);
    }

    event messageSent(uint256 externalNullifier);

    function submit(
        uint256 groupId,
        uint256 merkleTreeRoot,
        uint256 signal,
        uint256 nullifierHash,
        uint256 externalNullifier,
        uint256[8] calldata proof,
        uint64 _paymentChainSelector,
        address _receiver
    ) external returns (bytes32 messageId) {
        bytes memory message = abi.encode(groupId, merkleTreeRoot, signal, nullifierHash, externalNullifier, proof, _paymentChainSelector, _receiver);

        if (destinationChain == sourceChain) {
            hackergroup.receiveMessage(message);
            emit messageSent(externalNullifier);
            return '1';
        } else {
            // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message

            Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
                receiver: abi.encode(hackergroup), // ABI-encoded receiver address
                data: message, // ABI-encoded string
                tokenAmounts: new Client.EVMTokenAmount[](0), // Empty array indicating no tokens are being sent
                extraArgs: Client._argsToBytes(
                    // Additional arguments, setting gas limit and non-strict sequencing mode
                    Client.EVMExtraArgsV1({gasLimit: 200_000, strict: false})
                ),
                // Set the feeToken  address, indicating LINK will be used for fees
                feeToken: address(linkToken)
            });

            // Get the fee required to send the message
            uint256 fees = router.getFee(destinationChain, evm2AnyMessage);

            if (fees > linkToken.balanceOf(address(this))) revert NotEnoughBalance(linkToken.balanceOf(address(this)), fees);

            // approve the Router to transfer LINK tokens on contract's behalf. It will spend the fees in LINK
            linkToken.approve(address(router), fees);

            // Send the message through the router and store the returned message ID
            messageId = router.ccipSend(destinationChain, evm2AnyMessage);

            // Emit an event with message details

            emit messageSent(externalNullifier);

            // Return the message ID
            return messageId;
        }
    }

}
