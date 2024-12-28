import { ContractInstance } from "../types";

export const appInitialState: State = {
  loading: { screen: true },
  contractInstances: []
  // settings: {
  //   sendValue: '0',
  //   sendUnit: 'wei',
  //   gasLimit: 3000000,
  //   networkName: 'Goerli',
  //   loadedAccounts: {},
  //   isRequesting: false,
  //   isSuccessful: false,
  //   error: null,
  //   selectedAccount: '',s
  //   provider: window.ethereum ? 'metamask' : 'walletconnect',
  //   theme: 'Dark',
  // },
  // terminal: { journalBlocks: [], hidden: false, height: 250 },
};

export interface State {
  loading: { screen: boolean },
  contractInstances: ContractInstance[]
};

export type ActionType = 'SET_LOADING' | 'SET_INSTANCE' | 'SET_SETTINGS' | 'SET_TERMINAL' | 'PIN_INSTANCE' | 'UNPIN_INSTANCE' | 'REMOVE_INSTANCE' | 'CLEAR_INSTANCES';

export const SET_LOADING: ActionType = 'SET_LOADING';
export const SET_INSTANCE: ActionType = 'SET_INSTANCE';
export const SET_SETTINGS: ActionType = 'SET_SETTINGS';
export const SET_TERMINAL: ActionType = 'SET_TERMINAL';
export const PIN_INSTANCE: ActionType = 'PIN_INSTANCE';
export const UNPIN_INSTANCE: ActionType = 'UNPIN_INSTANCE';
export const REMOVE_INSTANCE: ActionType = 'REMOVE_INSTANCE';
export const CLEAR_INSTANCES: ActionType = 'CLEAR_INSTANCES';

export type Action =
  {
    type: ActionType,
    payload: any
  };

export const appReducer = (state = appInitialState, action: Action): State => {
  switch (action.type) {
    case SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, ...action.payload },
      };

    case SET_INSTANCE:
      return {
        ...state,
        contractInstances: [...state.contractInstances, action.payload],
      };

    case REMOVE_INSTANCE: {
      const payload: { index: number } = action.payload
      return {
        ...state,
        contractInstances: state.contractInstances.filter((_, index) => index !== payload.index)
      }
    }

    case CLEAR_INSTANCES: {
      return {
        ...state,
        contractInstances: []
      }
    }

    // case UPDATE_INSTANCES_BALANCE: {
    //   const payload: Array<{ contractData: ContractData, address: string, balance: number, name: string, abi?: any, decodedResponse?: Record<number, any> }> = action.payload

    //   return {
    //     ...state,
    //     instances: {
    //       ...state.instances,
    //       instanceList: payload
    //     }
    //   }
    // }

    // case PIN_INSTANCE: {
    //   const payload: { index: number, pinnedAt: number, filePath: string } = action.payload
    //   state.instances.instanceList[payload.index].isPinned = true
    //   state.instances.instanceList[payload.index].pinnedAt = payload.pinnedAt
    //   state.instances.instanceList[payload.index].filePath = payload.filePath
    //   return {
    //     ...state,
    //     instances: {
    //       ...state.instances,
    //     }
    //   }
    // }

    // case UNPIN_INSTANCE: {
    //   const payload: { index: number } = action.payload
    //   state.instances.instanceList[payload.index].isPinned = false
    //   return {
    //     ...state,
    //     instances: {
    //       ...state.instances,
    //     }
    //   }
    // }

    // case 'SET_SETTINGS':
    //   return {
    //     ...state,
    //     settings: { ...state.settings, ...action.payload },
    //   };

    // case 'SET_TERMINAL':
    //   return {
    //     ...state,
    //     terminal: { ...state.terminal, ...action.payload },
    //   };

    default:
      throw new Error("Invalid action type");
  }
};
