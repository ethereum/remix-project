import React, { useEffect, useState } from "react";


export const Fetch = () => {

  const fetch = async () => {
    //gitservice.fetch(currentRemote, '', '')
  }


  return (
    <>
      <button type="button" onClick={async () => fetch()} className="btn btn-primary w-100">Fetch</button>
    </>)
}