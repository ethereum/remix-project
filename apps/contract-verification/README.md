# Contract Verification Plugin

With this plugin, contracts written and compiled in Remix can be verified at Sourcify, Etherscan, Blockscout and Routescan at the same time. Besides that, the source code of any address can be fetched from the verifiers and added to the file editor.

## Adding a new verification service

Currently, the plugin supports Sourcify, Etherscan, Blockscout and Routescan. To add a new verifier, you need to make the following changes:

In `./src/app/types/VerificationTypes.ts`, add the new verifier to the `VerifierIdentifier` type and the `VERIFIERS` array.

In order to interact with the API of the verification service, you need to create a new class that extends the `AbstractVerifier` class. If your API is based on the Etherscan API, you can simply extend the `EtherscanVerifier` class. In this case, see the `RoutescanVerifier` and the `BlockscoutVerifier` for reference. All related classes are located in the `./src/app/Verifiers` directory.

In `./src/app/Verifiers/index.ts`, add your new verifier to the `getVerifier` function. Validate any settings properties that are required by your verifier.

In `./src/app/utils/default-apis.json`, you need to add default settings for your new verifier. If you can, simply add your defaults in the form of `{ [VerifierIdentifier]: { [chainId]: { apiUrl: [value], explorerUrl: [value] } } }`. If you need more flexibility, you might also want to change the `src/app/utils/default-settings.ts` file. See Routescan there for reference.

Your new verifier will automatically be shown in the `VerifyView` and the `LookupView` since we added it to the `VERIFIERS` array. You only need to make a change to the `SettingsView` because the required settings depend on the verifier. There, add a new div block in the same format as the other verifiers. Only add the `ConfigInput` elements for the settings that your verifier needs to the div block.

That's it! Your verification service should be able to verify contracts through Remix now.
