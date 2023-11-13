// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4;
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IHackerGroup} from "contracts/IHackerGroup.sol";

contract MockRouter {
    function ccipSend(uint64 destinationChainSelector, Client.EVM2AnyMessage memory message) external returns (bytes32) {
        address rec = abi.decode(message.receiver, (address));
        Client.Any2EVMMessage memory messageToSend;
        messageToSend.data = message.data;
        IHackerGroup(rec).receiveMessage(message.data);
        return '123';
    }

    function getFee(uint64 destinationChainSelector, Client.EVM2AnyMessage memory message) external pure returns (uint256 fee) {
        message;
        destinationChainSelector;
        return  0;
    }
}
