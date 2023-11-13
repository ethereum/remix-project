// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.4;
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";

/// @title HackerGroup contract interface.
interface IHackerGroup {

    event bugCreated(uint256 externalNullifier);

    event bugApproved(uint256 externalNullifier);

    event bugRejected(uint256 externalNullifier);

    event bugClosed(uint256 externalNullifier);

    event messageReceived(uint256 externalNullifier);

    function receiveMessage(bytes memory data) external;

}
