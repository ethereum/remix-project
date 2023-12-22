import { FileType, WorkspaceElement } from "../types";
import React, { useEffect, useState, useRef, SyntheticEvent } from 'react' // eslint-disable-line
import { RecursiveTree } from "./file-recursive-tree";


export const NewFileExplorer = (props: any) => {

  useEffect(() => {
    console.log('new file explorer props', props)
  }, [props])

  return (<></>)


}