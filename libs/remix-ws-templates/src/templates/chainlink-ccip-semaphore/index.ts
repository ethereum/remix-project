export default async () => {
  return {
      // @ts-ignore
      '.prettierrc': (await import('raw-loader!./.prettierrc')).default,
      // @ts-ignore
      'README.md': (await import('raw-loader!./README.md')).default,
      // @ts-ignore
      'contracts/CCIP-BnM.sol': (await import('raw-loader!./contracts/CCIP-BnM.sol')).default,
      // @ts-ignore
      'contracts/IHackerGroup.sol': (await import('raw-loader!./contracts/IHackerGroup.sol')).default,
      // @ts-ignore
      'contracts/Link.sol': (await import('raw-loader!./contracts/Link.sol')).default,
      // @ts-ignore
      'contracts/Router.sol': (await import('raw-loader!./contracts/Router.sol')).default,
      // @ts-ignore
      'contracts/demo ccip contracts/Receiver.sol': (await import('raw-loader!./contracts/demo ccip contracts/Receiver.sol')).default,
      // @ts-ignore
      'contracts/demo ccip contracts/Sender.sol': (await import('raw-loader!./contracts/demo ccip contracts/Sender.sol')).default,
      // @ts-ignore
      'contracts/demo ccip contracts/transferToken.sol': (await import('raw-loader!./contracts/demo ccip contracts/transferToken.sol')).default,
      // @ts-ignore
      'contracts/hackerClient.sol': (await import('raw-loader!./contracts/hackerClient.sol')).default,
      // @ts-ignore
      'contracts/hackergroup.sol': (await import('raw-loader!./contracts/hackergroup.sol')).default,
      // @ts-ignore
      'data/group_id.json': (await import('./data/group_id.json.raw!=!raw-loader!./data/group_id.json')).default,
      // @ts-ignore
      'data/proof_approve.json': (await import('./data/proof_approve.json.raw!=!raw-loader!./data/proof_approve.json')).default,
      // @ts-ignore
      'data/proof_submit.json': (await import('./data/proof_submit.json.raw!=!raw-loader!./data/proof_submit.json')).default,
      // @ts-ignore
      'data/semaphore_deployment.json': (await import('./data/semaphore_deployment.json.raw!=!raw-loader!./data/semaphore_deployment.json')).default,
      // @ts-ignore
      'index.ts': (await import('raw-loader!./index.ts')).default,
      // @ts-ignore
      'scripts/0_compile_1.ts': (await import('raw-loader!./scripts/0_compile_1.ts')).default,
      // @ts-ignore
      'scripts/0_compile_2.ts': (await import('raw-loader!./scripts/0_compile_2.ts')).default,
      // @ts-ignore
      'scripts/0_compile_3.ts': (await import('raw-loader!./scripts/0_compile_3.ts')).default,
      // @ts-ignore
      'scripts/0_compile_4.ts': (await import('raw-loader!./scripts/0_compile_4.ts')).default,
      // @ts-ignore
      'scripts/1_deploy_semaphore.ts': (await import('raw-loader!./scripts/1_deploy_semaphore.ts')).default,
      // @ts-ignore
      'scripts/2.1_addmembers.ts': (await import('raw-loader!./scripts/2.1_addmembers.ts')).default,
      // @ts-ignore
      'scripts/2_create_groups.ts': (await import('raw-loader!./scripts/2_create_groups.ts')).default,
      // @ts-ignore
      'scripts/3_store_groups.ts': (await import('raw-loader!./scripts/3_store_groups.ts')).default,
      // @ts-ignore
      'scripts/helpers/convertsignal.ts': (await import('raw-loader!./scripts/helpers/convertsignal.ts')).default,
      // @ts-ignore
      'scripts/helpers/createProofForIdendity.ts': (await import('raw-loader!./scripts/helpers/createProofForIdendity.ts')).default,
      // @ts-ignore
      'scripts/helpers/deploy.ts': (await import('raw-loader!./scripts/helpers/deploy.ts')).default,
      // @ts-ignore
      'scripts/helpers/packProof.ts': (await import('raw-loader!./scripts/helpers/packProof.ts')).default,
      // @ts-ignore
      'scripts/helpers/unpackProof.ts': (await import('raw-loader!./scripts/helpers/unpackProof.ts')).default,
      // @ts-ignore
      'scripts/manual operations/4.1_generate_proof_approve.ts': (await import('raw-loader!./scripts/manual operations/4.1_generate_proof_approve.ts')).default,
      // @ts-ignore
      'scripts/manual operations/4.5_generate_proof_with_trusted_setup.ts': (await import('raw-loader!./scripts/manual operations/4.5_generate_proof_with_trusted_setup.ts')).default,
      // @ts-ignore
      'scripts/manual operations/4_generate_proof_submit.ts': (await import('raw-loader!./scripts/manual operations/4_generate_proof_submit.ts')).default,
      // @ts-ignore
      'scripts/manual operations/5_verify_proof_on_chain.ts': (await import('raw-loader!./scripts/manual operations/5_verify_proof_on_chain.ts')).default,
      // @ts-ignore
      'scripts/manual operations/6_get_verified_proofs.ts': (await import('raw-loader!./scripts/manual operations/6_get_verified_proofs.ts')).default,
      // @ts-ignore
      'scripts/manual operations/7_generate_cids.ts': (await import('raw-loader!./scripts/manual operations/7_generate_cids.ts')).default,
      // @ts-ignore
      'scripts/manual operations/7_hackergroup_events.ts': (await import('raw-loader!./scripts/manual operations/7_hackergroup_events.ts')).default,
      // @ts-ignore
      'scripts/tests/hackerClient.test.ts': (await import('raw-loader!./scripts/tests/hackerClient.test.ts')).default,
      // @ts-ignore
      'scripts/tests/hackergroup.test.ts': (await import('raw-loader!./scripts/tests/hackergroup.test.ts')).default,
      // @ts-ignore
      'scripts/types/types.ts': (await import('raw-loader!./scripts/types/types.ts')).default,
      // @ts-ignore
      'semaphore/contracts/README.md': (await import('raw-loader!./semaphore/contracts/README.md')).default,
      // @ts-ignore
      'semaphore/contracts/Semaphore.sol': (await import('raw-loader!./semaphore/contracts/Semaphore.sol')).default,
      // @ts-ignore
      'semaphore/contracts/artifacts/Semaphore.json': (await import('./semaphore/contracts/artifacts/Semaphore.json.raw!=!raw-loader!./semaphore/contracts/artifacts/Semaphore.json')).default,
      // @ts-ignore
      'semaphore/contracts/artifacts/Semaphore_metadata.json': (await import('./semaphore/contracts/artifacts/Semaphore_metadata.json.raw!=!raw-loader!./semaphore/contracts/artifacts/Semaphore_metadata.json')).default,
      // @ts-ignore
      'semaphore/contracts/base/Pairing.sol': (await import('raw-loader!./semaphore/contracts/base/Pairing.sol')).default,
      // @ts-ignore
      'semaphore/contracts/base/SemaphoreGroups.sol': (await import('raw-loader!./semaphore/contracts/base/SemaphoreGroups.sol')).default,
      // @ts-ignore
      'semaphore/contracts/base/SemaphoreVerifier.sol': (await import('raw-loader!./semaphore/contracts/base/SemaphoreVerifier.sol')).default,
      // @ts-ignore
      'semaphore/contracts/extensions/SemaphoreVoting.sol': (await import('raw-loader!./semaphore/contracts/extensions/SemaphoreVoting.sol')).default,
      // @ts-ignore
      'semaphore/contracts/extensions/SemaphoreWhistleblowing.sol': (await import('raw-loader!./semaphore/contracts/extensions/SemaphoreWhistleblowing.sol')).default,
      // @ts-ignore
      'semaphore/contracts/interfaces/ISemaphore.sol': (await import('raw-loader!./semaphore/contracts/interfaces/ISemaphore.sol')).default,
      // @ts-ignore
      'semaphore/contracts/interfaces/ISemaphoreGroups.sol': (await import('raw-loader!./semaphore/contracts/interfaces/ISemaphoreGroups.sol')).default,
      // @ts-ignore
      'semaphore/contracts/interfaces/ISemaphoreVerifier.sol': (await import('raw-loader!./semaphore/contracts/interfaces/ISemaphoreVerifier.sol')).default,
      // @ts-ignore
      'semaphore/contracts/interfaces/ISemaphoreVoting.sol': (await import('raw-loader!./semaphore/contracts/interfaces/ISemaphoreVoting.sol')).default,
      // @ts-ignore
      'semaphore/contracts/interfaces/ISemaphoreWhistleblowing.sol': (await import('raw-loader!./semaphore/contracts/interfaces/ISemaphoreWhistleblowing.sol')).default,
      // @ts-ignore
      'zk/circuits/mux1.circom': (await import('raw-loader!./zk/circuits/mux1.circom')).default,
      // @ts-ignore
      'zk/circuits/poseidon.circom': (await import('raw-loader!./zk/circuits/poseidon.circom')).default,
      // @ts-ignore
      'zk/circuits/poseidon_constants.circom': (await import('raw-loader!./zk/circuits/poseidon_constants.circom')).default,
      // @ts-ignore
      'zk/circuits/semaphore.circom': (await import('raw-loader!./zk/circuits/semaphore.circom')).default,
      // @ts-ignore
      'zk/circuits/tree.circom': (await import('raw-loader!./zk/circuits/tree.circom')).default,
      // @ts-ignore
      'zk/scripts/deploy.ts': (await import('raw-loader!./zk/scripts/deploy.ts')).default,
      // @ts-ignore
      'zk/scripts/run_setup.ts': (await import('raw-loader!./zk/scripts/run_setup.ts')).default,
      // @ts-ignore
      'zk/scripts/run_verification.ts': (await import('raw-loader!./zk/scripts/run_verification.ts')).default,
      // @ts-ignore
      'zk/templates/groth16_verifier.sol.ejs': (await import('raw-loader!./zk/templates/groth16_verifier.sol.ejs')).default
  }
}