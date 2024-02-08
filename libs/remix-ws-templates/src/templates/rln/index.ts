export default async () => {
  return {
    // @ts-ignore
    'circuits/rln.circom': (await import('raw-loader!./circuits/rln.circom')).default,
    // @ts-ignore
    'circuits/utils.circom': (await import('!!raw-loader!./circuits/utils.circom')).default,
    // @ts-ignore
    'circuits/withdraw.circom': (await import('!!raw-loader!./circuits/withdraw.circom')).default,
    // @ts-ignore
    'scripts/run_setup.ts': (await import('!!raw-loader!./scripts/run_setup.ts')).default,
    // @ts-ignore
    'scripts/run_verification.ts': (await import('!!raw-loader!./scripts/run_verification.ts')).default,
    // @ts-ignore
    'templates/groth16_verifier.sol.ejs': (await import('!!raw-loader!./templates/groth16_verifier.sol.ejs')).default,
    // @ts-ignore
    'LICENSE-APACHE': (await import('!!raw-loader!./LICENSE-APACHE')).default,
    // @ts-ignore
    'LICENSE-MIT': (await import('!!raw-loader!./LICENSE-MIT')).default,
    // @ts-ignore
    'README.md': (await import('raw-loader!./README.md')).default,
    // @ts-ignore
    '.sindriignore': (await import('raw-loader!./.sindriignore')).default,
    // @ts-ignore
    'sindri.json': (await import('./sindri.json.raw!=!raw-loader!./sindri.json')).default,
  }
}