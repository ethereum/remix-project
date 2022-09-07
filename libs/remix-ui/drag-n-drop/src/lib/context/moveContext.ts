import { createContext } from "react";
import { MoveContextType } from "../types";

export const MoveContext = createContext<MoveContextType>({
  dragged: {} as { path: string, isDirectory: boolean },
  moveFile: () => null,
  moveFolder: () => null,
  currentlyMoved: () => null
})
