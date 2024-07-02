import React, { useEffect, useState } from "react";
import { PushPull } from "./commands/pushpull";
import { Fetch } from "./commands/fetch";
import { Merge } from "./commands/merge";

export const Commands = () => {

  return (
    <div>
      <PushPull></PushPull>
      <hr></hr>
      <Fetch></Fetch>
    </div>)
}
