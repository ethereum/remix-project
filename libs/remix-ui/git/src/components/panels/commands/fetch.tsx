import React, { useEffect, useState } from "react";
import { gitActionsContext } from "../../../state/context";


export const Fetch = () => {
  const actions = React.useContext(gitActionsContext)
  const fetch = async () => {
    await actions.fetch()
  }


  return (
    <>
      <button type="button" onClick={async () => fetch()} className="btn btn-primary w-100">Fetch</button>
    </>)
}