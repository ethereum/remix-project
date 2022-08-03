import { FileType } from "libs/remix-ui/workspace/src/lib/types";
import React, {
  createContext,
  ReactNode,
  useContext,
  useRef,
  useState,
} from "react";

interface MoveContextType {
  dragged: string;
  isDraggable?: boolean;
  moveFile: (dest: string, dragged: string) => void;
  currentlyMoved: (path: string) => void;
}
interface DraggableType {
  children: ReactNode;
  file: FileType;
  isDraggable?: boolean;
  expandedPath: string[];
  handleClickFolder: (path: string, type: string) => void;
}

interface DragType {
  children: ReactNode;
  onFileMoved: (dest: string, dragged: string) => void;
}

export const MoveContext = createContext<MoveContextType>({
  dragged: "",
  moveFile: () => {},
  currentlyMoved: () => {},
});

export const Drag = (props: DragType) => {
  const [dragged, setDragged] = useState<string>("");

  return (
    <MoveContext.Provider
      value={{
        dragged: dragged,
        moveFile: props.onFileMoved,
        currentlyMoved: (path) => {
          setDragged(() => path);
        },
      }}
    >
      {props.children}
    </MoveContext.Provider>
  );
};

export const Draggable = (props: DraggableType) => {
  const dragRef = useRef<HTMLSpanElement>(),
    file = props.file,
    context = useContext(MoveContext);

  const handleDrop = (event: React.DragEvent<HTMLSpanElement>) => {
    event.preventDefault();

    if (file.isDirectory) {
      context.moveFile(file.path, context.dragged);
    }
  };

  const handleDragover = (event: React.DragEvent<HTMLSpanElement>) => {
    //Checks if the folder is opened
    event.preventDefault();
    if (file.isDirectory && !props.expandedPath.includes(file.path)) {
      props.handleClickFolder(file.path, file.type);
    }
  };
  const handleDrag = () => {
    if (context.dragged !== file.path) {
      context.currentlyMoved(file.path);
    }
  };

  if (props.isDraggable) {
    return <>{props.children}</>;
  }

  return (
    <span
      ref={dragRef}
      draggable
      onDrop={(event) => {
        handleDrop(event);
      }}
      onDragStart={(event) => {
        if (file) {
          handleDrag();
        }
      }}
      onDragOver={(event) => {
        if (file && file.isDirectory) {
          handleDragover(event);
        }
      }}
    >
      {props.children}
    </span>
  );
};
