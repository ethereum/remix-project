import { createContext } from "react";
import { MoveContextType } from "../types";

export const MoveContext = createContext<MoveContextType>({
  dragged: "",
  moveFile: () => {},
  currentlyMoved: () => {}
})
