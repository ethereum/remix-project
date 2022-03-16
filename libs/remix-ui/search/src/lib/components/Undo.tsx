import { useDialogDispatchers } from "@remix-ui/app"
import React from "react"
import { useContext } from "react"
import { SearchContext } from "../context/context"

export const Undo = () => {
    const {
        state,
        undoReplace
    } = useContext(SearchContext)
    const { alert } = useDialogDispatchers()


    const undo = async () => {
        try{
            await undoReplace(state.undoBuffer[0])
        }catch(e){
            alert({ id: 'undo_error', title: 'Cannot undo this change', message: e.message })
        }
    }

    return (<>
        {state.undoBuffer && state.undoBuffer.length > 0 ?
            <button onClick={async() => await undo()} className="btn btn-secondary btn-block">
                <div className="fas fa-undo mr-2"></div>
                Undo changes to {state.undoBuffer[0].path}
            </button> : null}
    </>)
}