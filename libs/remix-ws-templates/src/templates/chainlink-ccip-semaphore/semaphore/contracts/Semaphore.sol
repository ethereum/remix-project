// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./interfaces/ISemaphore.sol";
import "./interfaces/ISemaphoreVerifier.sol";
import "./base/SemaphoreGroups.sol";

/// @title Semaphore
/// @dev This contract uses the Semaphore base contracts to provide a complete service
/// to allow admins to create and manage groups and their members to generate Semaphore proofs
/// and verify them. Group admins can add, update or remove group members, and can be
/// an Ethereum account or a smart contract. This contract also assigns each new Merkle tree
/// generated with a new root a duration (or an expiry) within which the proofs generated with that root
/// can be validated.
contract Semaphore is ISemaphore, SemaphoreGroups {
    ISemaphoreVerifier public verifier;

    /// @dev Gets a group id and returns the group parameters.
    mapping(uint256 => Group) public groups;

    /// @dev Checks if the group admin is the transaction sender.
    /// @param groupId: Id of the group.
    modifier onlyGroupAdmin(uint256 groupId) {
        if (groups[groupId].admin != _msgSender()) {
            revert Semaphore__CallerIsNotTheGroupAdmin();
        }
        _;
    }

    /// @dev Checks if there is a verifier for the given tree depth.
    /// @param merkleTreeDepth: Depth of the tree.
    modifier onlySupportedMerkleTreeDepth(uint256 merkleTreeDepth) {
        if (merkleTreeDepth < 16 || merkleTreeDepth > 32) {
            revert Semaphore__MerkleTreeDepthIsNotSupported();
        }
        _;
    }

    /// @dev Initializes the Semaphore verifier used to verify the user's ZK proofs.
    /// @param _verifier: Semaphore verifier address.
    constructor(ISemaphoreVerifier _verifier) {
        verifier = _verifier;
    }

    /// @dev See {ISemaphore-createGroup}.
    function createGroup(
        uint256 groupId,
        uint256 merkleTreeDepth,
        address admin
    ) external override onlySupportedMerkleTreeDepth(merkleTreeDepth) {
        _createGroup(groupId, merkleTreeDepth);

        groups[groupId].admin = admin;
        groups[groupId].merkleTreeDuration = 1 hours;

        emit GroupAdminUpdated(groupId, address(0), admin);
    }

    /// @dev See {ISemaphore-createGroup}.
    function createGroup(
        uint256 groupId,
        uint256 merkleTreeDepth,
        address admin,
        uint256 merkleTreeDuration
    ) external override onlySupportedMerkleTreeDepth(merkleTreeDepth) {
        _createGroup(groupId, merkleTreeDepth);

        groups[groupId].admin = admin;
        groups[groupId].merkleTreeDuration = merkleTreeDuration;

        emit GroupAdminUpdated(groupId, address(0), admin);
    }

    /// @dev See {ISemaphore-updateGroupAdmin}.
    function updateGroupAdmin(uint256 groupId, address newAdmin) external override onlyGroupAdmin(groupId) {
        groups[groupId].admin = newAdmin;

        emit GroupAdminUpdated(groupId, _msgSender(), newAdmin);
    }

    /// @dev See {ISemaphore-updateGroupMerkleTreeDuration}.
    function updateGroupMerkleTreeDuration(
        uint256 groupId,
        uint256 newMerkleTreeDuration
    ) external override onlyGroupAdmin(groupId) {
        uint256 oldMerkleTreeDuration = groups[groupId].merkleTreeDuration;

        groups[groupId].merkleTreeDuration = newMerkleTreeDuration;

        emit GroupMerkleTreeDurationUpdated(groupId, oldMerkleTreeDuration, newMerkleTreeDuration);
    }

    /// @dev See {ISemaphore-addMember}.
    function addMember(uint256 groupId, uint256 identityCommitment) external override onlyGroupAdmin(groupId) {
        _addMember(groupId, identityCommitment);

        uint256 merkleTreeRoot = getMerkleTreeRoot(groupId);

        groups[groupId].merkleRootCreationDates[merkleTreeRoot] = block.timestamp;
    }

    /// @dev See {ISemaphore-addMembers}.
    function addMembers(
        uint256 groupId,
        uint256[] calldata identityCommitments
    ) external override onlyGroupAdmin(groupId) {
        for (uint256 i = 0; i < identityCommitments.length; ) {
            _addMember(groupId, identityCommitments[i]);

            unchecked {
                ++i;
            }
        }

        uint256 merkleTreeRoot = getMerkleTreeRoot(groupId);

        groups[groupId].merkleRootCreationDates[merkleTreeRoot] = block.timestamp;
    }

    /// @dev See {ISemaphore-updateMember}.
    function updateMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256 newIdentityCommitment,
        uint256[] calldata proofSiblings,
        uint8[] calldata proofPathIndices
    ) external override onlyGroupAdmin(groupId) {
        _updateMember(groupId, identityCommitment, newIdentityCommitment, proofSiblings, proofPathIndices);

        uint256 merkleTreeRoot = getMerkleTreeRoot(groupId);

        groups[groupId].merkleRootCreationDates[merkleTreeRoot] = block.timestamp;
    }

    /// @dev See {ISemaphore-removeMember}.
    function removeMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256[] calldata proofSiblings,
        uint8[] calldata proofPathIndices
    ) external override onlyGroupAdmin(groupId) {
        _removeMember(groupId, identityCommitment, proofSiblings, proofPathIndices);

        uint256 merkleTreeRoot = getMerkleTreeRoot(groupId);

        groups[groupId].merkleRootCreationDates[merkleTreeRoot] = block.timestamp;
    }

    /// @dev See {ISemaphore-verifyProof}.
    function verifyProof(
        uint256 groupId,
        uint256 merkleTreeRoot,
        uint256 signal,
        uint256 nullifierHash,
        uint256 externalNullifier,
        uint256[8] calldata proof
    ) external override {
        uint256 merkleTreeDepth = getMerkleTreeDepth(groupId);

        if (merkleTreeDepth == 0) {
            revert Semaphore__GroupDoesNotExist();
        }

        uint256 currentMerkleTreeRoot = getMerkleTreeRoot(groupId);

        // A proof could have used an old Merkle tree root.
        // https://github.com/semaphore-protocol/semaphore/issues/98
        if (merkleTreeRoot != currentMerkleTreeRoot) {
            uint256 merkleRootCreationDate = groups[groupId].merkleRootCreationDates[merkleTreeRoot];
            uint256 merkleTreeDuration = groups[groupId].merkleTreeDuration;

            if (merkleRootCreationDate == 0) {
                revert Semaphore__MerkleTreeRootIsNotPartOfTheGroup();
            }

            if (block.timestamp > merkleRootCreationDate + merkleTreeDuration) {
                revert Semaphore__MerkleTreeRootIsExpired();
            }
        }

        if (groups[groupId].nullifierHashes[nullifierHash]) {
            revert Semaphore__YouAreUsingTheSameNillifierTwice();
        }

        verifier.verifyProof(merkleTreeRoot, nullifierHash, signal, externalNullifier, proof, merkleTreeDepth);

        groups[groupId].nullifierHashes[nullifierHash] = true;

        emit ProofVerified(groupId, merkleTreeRoot, nullifierHash, externalNullifier, signal);
    }
}
