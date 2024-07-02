import React, { useEffect, useState } from "react";
import { PushPull } from "./commands/pushpull";
import { Fetch } from "./commands/fetch";
import { Merge } from "./commands/merge";

export const Commands = () => {

  return (
    <div className="px-3 py-2">
      <PushPull></PushPull>
      <hr></hr>
      <Fetch></Fetch>
    </div>)
}
