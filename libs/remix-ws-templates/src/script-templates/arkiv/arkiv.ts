import { createWalletClient, createPublicClient, ExpirationTime } from '@arkiv-network/sdk';
import { stringToPayload } from '@arkiv-network/sdk/utils';
import { tiramisu } from '@arkiv-network/sdk/chains';
import { http, custom } from 'viem';

const saveToArkiv = async (message: string) => {
  console.log('saving to arkiv: ' + message)
  const address = await remix.call('udappEnv' as any, 'getSelectedAccount');
  console.log('using ' + address)

  try {
    const walletClient = createWalletClient({
      chain: tiramisu,
      transport: custom(web3Provider),
      account: address
    });

    const publicClient = createPublicClient({
      chain: tiramisu,
      transport: http(),
    });

    // Create an entity
    const { entityKey, txHash } = await walletClient.createEntity({
      payload: stringToPayload(message),
      contentType: 'text/plain',
      attributes: { type: 'greeting' },
      expires: ExpirationTime.fromHours(1),
    });

    console.log('Entity created:', entityKey);
    console.log('Transaction:', txHash);

    // Read it back
    const entity = await publicClient.getEntity(entityKey);
    console.log('Retrieved:', entity.toText());
  } catch (e) {
    console.error(e)
  }
}

saveToArkiv('Hello, Arkiv!')
