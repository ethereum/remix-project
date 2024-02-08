export default async () => {
  return {
    // @ts-ignore
    'circuits/semaphore.circom': (await import('raw-loader!./circuits/semaphore.circom')).default,
    // @ts-ignore
    'circuits/simple.circom': (await import('!!raw-loader!./circuits/simple.circom')).default,
    // @ts-ignore
    'circuits/tree.circom': (await import('!!raw-loader!./circuits/tree.circom')).default,
    // @ts-ignore
    'scripts/run_setup.ts': (await import('!!raw-loader!./scripts/run_setup.ts')).default,
    // @ts-ignore
    'scripts/run_verification.ts': (await import('!!raw-loader!./scripts/run_verification.ts')).default,
    // @ts-ignore
    'templates/groth16_verifier.sol.ejs': (await import('!!raw-loader!./templates/groth16_verifier.sol.ejs')).default,
    // @ts-ignore
    'README.md': (await import('raw-loader!./README.md')).default,
    // @ts-ignore
    '.sindriignore': (await import('raw-loader!./.sindriignore')).default,
    // @ts-ignore
    'sindri.json': (await import('./sindri.json.raw!=!raw-loader!./sindri.json')).default,
  }
}