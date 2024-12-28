import ContractInteractionPluginClient from '../ContractInteractionPluginClient';

import { CLEAR_INSTANCES, PIN_INSTANCE, REMOVE_INSTANCE, SET_INSTANCE, UNPIN_INSTANCE } from "../reducers/state"
import { ContractInstance } from '../types/AbiProviderTypes';

let dispatch: React.Dispatch<any>

export const initDispatch = (_dispatch: React.Dispatch<any>) => {
    dispatch = _dispatch;
};

export const loadPluginAction = async () => {
    await dispatch({
        type: 'SET_LOADING',
        payload: {
            screen: true,
        },
    });

    await ContractInteractionPluginClient.onload();

    //  await ContractVerificationPluginClient.call('layout', 'minimize', 'terminal', true);

    await dispatch({
        type: 'SET_LOADING',
        payload: {
            screen: false,
        },
    });
};

//contractData?: ContractData,
export const setInstanceAction = (instance: ContractInstance) => {
    dispatch({
        type: SET_INSTANCE,
        payload: instance
    })
}

export const pinInstanceAction = (index: number, pinnedAt: number, filePath: string) => {
    dispatch({
        type: PIN_INSTANCE,
        payload: {
            index,
            pinnedAt,
            filePath
        }
    })
}

export const unpinInstanceAction = (index: number) => {
    dispatch({
        type: UNPIN_INSTANCE,
        payload: {
            index
        }
    })
}

export const removeInstanceAction = (index: number) => {
    dispatch({
        type: REMOVE_INSTANCE,
        payload: {
            index
        }
    })
}

export const clearInstancesAction = () => {
    dispatch({
        type: CLEAR_INSTANCES
    })
}
