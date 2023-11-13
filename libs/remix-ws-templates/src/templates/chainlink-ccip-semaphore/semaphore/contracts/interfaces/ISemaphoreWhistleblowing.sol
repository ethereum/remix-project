//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

/// @title SemaphoreWhistleblowing contract interface.
interface ISemaphoreWhistleblowing {
    error Semaphore__CallerIsNotTheEditor();
    error Semaphore__MerkleTreeDepthIsNotSupported();

    struct Verifier {
        address contractAddress;
        uint256 merkleTreeDepth;
    }

    /// @dev Emitted when a new entity is created.
    /// @param entityId: Id of the entity.
    /// @param editor: Editor of the entity.
    event EntityCreated(uint256 entityId, address indexed editor);

    /// @dev Emitted when a whistleblower publish a new leak.
    /// @param entityId: Id of the entity.
    /// @param leak: News leak.
    event LeakPublished(uint256 indexed entityId, uint256 leak);

    /// @dev Creates an entity and the associated Merkle tree/group.
    /// @param entityId: Id of the entity.
    /// @param editor: Editor of the entity.
    /// @param merkleTreeDepth: Depth of the tree.
    function createEntity(uint256 entityId, address editor, uint256 merkleTreeDepth) external;

    /// @dev Adds a whistleblower to an entity.
    /// @param entityId: Id of the entity.
    /// @param identityCommitment: Identity commitment of the group member.
    function addWhistleblower(uint256 entityId, uint256 identityCommitment) external;

    /// @dev Removes a whistleblower from an entity.
    /// @param entityId: Id of the entity.
    /// @param identityCommitment: Identity commitment of the group member.
    /// @param proofSiblings: Array of the sibling nodes of the proof of membership.
    /// @param proofPathIndices: Path of the proof of membership.
    function removeWhistleblower(
        uint256 entityId,
        uint256 identityCommitment,
        uint256[] calldata proofSiblings,
        uint8[] calldata proofPathIndices
    ) external;

    /// @dev Allows whistleblowers to publish leaks anonymously.
    /// @param leak: News leak.
    /// @param nullifierHash: Nullifier hash.
    /// @param entityId: Id of the entity.
    /// @param proof: Private zk-proof parameters.
    function publishLeak(uint256 leak, uint256 nullifierHash, uint256 entityId, uint256[8] calldata proof) external;
}
