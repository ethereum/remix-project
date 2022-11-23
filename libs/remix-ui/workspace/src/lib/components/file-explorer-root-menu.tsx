import { extractParentFromKey } from "@remix-ui/helper";
import { customAction } from "@remixproject/plugin-api";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FileSystemContext } from "../contexts";
import {
  CopyElementType,
  FileExplorerState,
  FileFocusContextType,
  MenuItems,
} from "../types";
import { contextMenuDefaultActions, getFileMenuActions } from "../utils";
import { ROOT_PATH } from "../utils/constants";
import FileExplorerContextMenu from "./file-explorer-context-menu";

type FileExplorerRootMenuProps = {
  focusContext: FileFocusContextType;
  copyElement: CopyElementType;
  changeContextType: (newType: "file" | "folder") => void;
  handleCloseContextMenu: () => void;
};

export const FileExplorerRootMenu = (props: FileExplorerRootMenuProps) => {
  const [contextMenu, setContextMenu] = useState<FileExplorerState>(
    getFileMenuActions(ROOT_PATH, contextMenuDefaultActions)
  );
  const [canPaste, setCanPaste] = useState(false);
  const [contextType, setContextType] = useState<"file" | "folder">(null);
  const global = useContext(FileSystemContext);
  const focusElement = useRef(global.fs.focusElement);
  const expandPathRef = useRef(global.fs.localhost.expandPath || global.fs.browser.expandPath)
  
  useEffect(() => {
    setContextMenu((prevState) => ({
      ...prevState,
      actions: contextMenuDefaultActions,
      showContextMenu: true,
      focusContext: props.focusContext,
      focusEdit: { ...prevState.focusEdit, lastEdit: "" },
    }));
    if (props.copyElement) {
      handleCanCopy();
    }
  }, []);

  useEffect(() => {
    if (canPaste) {
      addMenuItems([
        {
          id: "paste",
          name: "Paste",
          type: ["folder", "file"],
          path: [],
          extension: [],
          pattern: [],
          multiselect: false,
          label: "",
        },
      ]);
    } else {
      removeMenuItems([
        {
          id: "paste",
          name: "Paste",
          type: ["folder", "file"],
          path: [],
          extension: [],
          pattern: [],
          multiselect: false,
          label: "",
        },
      ]);
    }
  }, [canPaste]);

  const editModeOn = (path: string, type: string, isNew = false) => {
    setContextMenu((prevState) => {
      return {
        ...prevState,
        focusEdit: { ...prevState.focusEdit, element: path, isNew, type },
      };
    });
  };

  const handleNewFileInput = async (parentFolder?: string) => {
    props.changeContextType("file");

    setContextType("file");
    await global.dispatchAddInputField(ROOT_PATH, "file");
    editModeOn(ROOT_PATH + "/blank", "file", true);
  };

  const handleNewFolderInput = async (parentFolder?: string) => {
    props.changeContextType("folder");

    setContextType("folder");

    if (!parentFolder) parentFolder = ROOT_PATH;
    else if (
      parentFolder.indexOf(".sol") !== -1 ||
      parentFolder.indexOf(".js") !== -1
    )
      parentFolder = extractParentFromKey(parentFolder);
    const expandPath = [
      ...new Set([...global.fs.browser.expandPath, parentFolder]),
    ];

    await global.dispatchAddInputField(parentFolder, "folder");
    global.dispatchHandleExpandPath(expandPath);
    editModeOn(parentFolder + "/context", "folder", true);
  };

  const handlePasteClick = (dest: string, destType: string) => {
    contextMenu.copyElement.map(({ key, type }) => {
      type === "file" ? copyFile(key, ROOT_PATH) : copyFolder(key, ROOT_PATH);
    });
  };
  const copyFile = (src: string, dest: string) => {
    try {
      global.dispatchCopyFile(src, dest);
    } catch (error) {
      global.modal(
        "Copy File Failed",
        "Unexpected error while copying file: " + src,
        "Close",
        async () => {}
      );
    }
  };

  const copyFolder = (src: string, dest: string) => {
    try {
      global.dispatchCopyFolder(src, dest);
    } catch (error) {
      global.modal(
        "Copy Folder Failed",
        "Unexpected error while copying folder: " + src,
        "Close",
        async () => {}
      );
    }
  };

  const emitContextMenuEvent = (cmd: customAction) => {
    try {
      global.dispatchEmitContextMenuEvent(cmd);
    } catch (error) {
      global.toast(error);
    }
  };

  const addMenuItems = (items: MenuItems) => {
    setContextMenu((prevState) => {
      // filter duplicate items
      const actions = items.filter(
        ({ name }) =>
          prevState.actions.findIndex((action) => action.name === name) === -1
      );

      return { ...prevState, actions: [...prevState.actions, ...actions] };
    });
  };

  const handlePublishToGist = (path?: string, type?: string) => {
    global.modal(
      "Create a public gist",
      `Are you sure you want to anonymously publish all your files in the ${name} workspace as a public gist on github.com?`,
      "OK",
      () => toGist(ROOT_PATH, type),
      "Cancel",
      () => {}
    );
  };

  const toGist = (path?: string, type?: string) => {
    global.dispatchPublishToGist(path, type);
  };

  const removeMenuItems = (items: MenuItems) => {
    setContextMenu((prevState) => {
      const actions = prevState.actions.filter(
        ({ id, name }) =>
          items.findIndex((item) => id === item.id && name === item.name) === -1
      );
      return { ...prevState, actions };
    });
  };

  const handleCanCopy = () => {
    setCanPaste(true);
    setContextMenu((prevState) => {
      return { ...prevState, copyElement: [props.copyElement] };
    });
  };

  const getFocusedFolder = () => {
    if (focusElement.current[0]) {
      if (focusElement.current[0].type === "folder" && focusElement.current[0].key)
        return focusElement.current[0].key;
      else if (
        focusElement.current[0].type === "gist" &&
        focusElement.current[0].key
      )
        return focusElement.current[0].key;
      else if (
        focusElement.current[0].type === "file" &&
        focusElement.current[0].key
      )
        return extractParentFromKey(focusElement.current[0].key)
          ? extractParentFromKey(focusElement.current[0].key)
          : ROOT_PATH;
      else return ROOT_PATH;
    }
  };

  const handleFileUpload = (target) => {
    console.log(getFocusedFolder())
    const parentFolder = getFocusedFolder();
    const expandPath = [...new Set([...expandPathRef.current, parentFolder])];

    global.dispatchHandleExpandPath(expandPath);
    global.dispatchUploadFile(target, parentFolder);
  };

  return (
    <FileExplorerContextMenu
      actions={contextMenu.actions}
      hideContextMenu={props.handleCloseContextMenu}
      createNewFile={handleNewFileInput}
      createNewFolder={handleNewFolderInput}
      pushChangesToGist={handlePublishToGist}
      paste={handlePasteClick}
      emit={emitContextMenuEvent}
      pageX={contextMenu.focusContext.x}
      pageY={contextMenu.focusContext.y}
      path={contextMenu.focusContext.element}
      type={contextMenu.focusContext.type}
      focus={[{ key: "contextMenu", type: contextType }]}
      uploadFile={handleFileUpload}
    />
  );
};
