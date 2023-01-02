import { ViewPlugin } from "@remixproject/engine-web";
import React, { useRef } from "react";
import { Button } from "react-bootstrap";
import { FlattenerAPI } from "../types";


export interface flattenerUIProps {
  plugin: FlattenerAPI & ViewPlugin
}

export const FlattenerUI = (props: flattenerUIProps) => {

  const { plugin } = props;
 
  const flatten = async () => {
    plugin.flatten()
  }

  const save = async () => {
    plugin.save()
  }

  return (
    <>
      <div className="App p-3">
        <div>
          Select a contract, compile it, then get the flattened version by pressing the button.
          Flattened source code will be copied to the clipboard.
        </div>

        {plugin.fileName ?
          <div>
            <Button className='btn-sm w-100' onClick={async () => { await flatten(); }}>Flatten {plugin.fileName}</Button>
          </div> : null}

        {plugin.flatFileName ?
          <><div className="mt-2">
            You can save the flattened version to the file inside Remix.
          </div><Button className='btn-sm w-100' onClick={async () => { await save(); }}>Save {plugin.flatFileName}</Button></>
          : null
        }
      </div>

    </>
  )
}