// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../core/Helpers.sol";
import "../core/BaseAccount.sol";

/**
 * Simple7702Account.sol
 * A minimal account to be used with EIP-7702 (for batching) and ERC-4337 (for gas sponsoring)
 */
contract Simple7702Account is BaseAccount, IERC165, IERC1271, ERC1155Holder, ERC721Holder {

    // address of entryPoint v0.8
    function entryPoint() public pure override returns (IEntryPoint) {
        return IEntryPoint(0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108);
    }

    /**
     * Make this account callable through ERC-4337 EntryPoint.
     * The UserOperation should be signed by this account's private key.
     */
    function _validateSignature(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash
    ) internal virtual override returns (uint256 validationData) {

        return _checkSignature(userOpHash, userOp.signature) ? SIG_VALIDATION_SUCCESS : SIG_VALIDATION_FAILED;
    }

    function isValidSignature(bytes32 hash, bytes memory signature) public view returns (bytes4 magicValue) {
        return _checkSignature(hash, signature) ? this.isValidSignature.selector : bytes4(0xffffffff);
    }

    function _checkSignature(bytes32 hash, bytes memory signature) internal view returns (bool) {
        return ECDSA.recover(hash, signature) == address(this);
    }

    function _requireForExecute() internal view virtual override {
        require(
            msg.sender == address(this) ||
            msg.sender == address(entryPoint()),
            "not from self or EntryPoint"
        );
    }

    function supportsInterface(bytes4 id) public override(ERC1155Holder, IERC165) pure returns (bool) {
        return
            id == type(IERC165).interfaceId ||
            id == type(IAccount).interfaceId ||
            id == type(IERC1271).interfaceId ||
            id == type(IERC1155Receiver).interfaceId ||
            id == type(IERC721Receiver).interfaceId;
    }

    // accept incoming calls (with or without value), to mimic an EOA.
    fallback() external payable {
    }

    receive() external payable {
    }
}
