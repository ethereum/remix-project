import type { ContractABI } from '../types'
import { FuncABI } from '@remix-project/core-plugin'

export abstract class AbstractAbiProvider {
  constructor(public apiUrl: string, public explorerUrl: string) { }

  abstract lookupABI(contractAddress: string): Promise<ContractABI>

  /**
   * Fetch ABI data from provider.
   *
   * @param url - URL to fetch the data from.
   * @returns An array of function ABIs.
   */
  static async fetchABI(url: string): Promise<FuncABI[]> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

      if (!response.ok) {
        console.error(`ERROR fetching ABI data from URL: ${url}`);
        throw new Error(`ERROR fetching ABI data from URL: ${url}`);
      }

      return await response.json()
    } catch (error) {
      console.error('An error occurred while fetching the ABI:', error);
      throw new Error('An error occurred while fetching the ABI:');
    }
  }
}
