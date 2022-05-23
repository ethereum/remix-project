// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title SampleERC721
 * @dev Create a sample ERC721 standard token
 */
contract SampleERC721 is ERC721 {

    constructor(string memory tokenName, string memory tokenSymbol) ERC721(tokenName, tokenSymbol) {}
}