import { FileAction, FileActionType } from "./types";

export default class FileActions {
  private actions: FileActionType[];
  private undoActions: FileActionType[];
  isFromLastAction: boolean;
  moveFile: (src: string, dest: string) => void;
  moveDir: (src: string, dest: string) => void;
  writeFile: (path, data) => void;
  remove: (path) => void;
  rename: (oldPath, newPath) => void;

  constructor(moveFile, moveDir, writeFile, remove, rename) {
    this.actions = [];
    this.undoActions = [];
    this.moveFile = moveFile;
    this.moveDir = moveDir;
    this.writeFile = writeFile;
    this.remove = remove;
    this.rename = rename;
  }

  /**
   * Records the last action that was performed by the user
   * @returns {void}
   */

  recordFileAction(action: FileAction, args: any) {
    if (!this.isFromLastAction) {
      this.actions.push({ action: action, args: args });
    }
    this.isFromLastAction = false;
  }

  /**
   * Undos the last action on the Filesystem
   * @param {string} action the action that was taken
   * @param {string} args the command that was used
   * @returns {void}
   */
  revertFileAction = async (redo: boolean) => {
    this.isFromLastAction = true;

    let lastAction = this.actions[this.actions.length - 1];
    if (redo) {
      lastAction = this.undoActions[this.undoActions.length - 1];
      this.undoActions.pop();
    } else {
      const popped = this.actions.pop();

      if (popped) {
        this.undoActions.push(popped);
      }
    }

    if (!lastAction) {
      return;
    }
    switch (lastAction.action) {
      case "move":
        let file = lastAction.args.src.substring(
            lastAction.args.src.lastIndexOf("/") + 1
          ),
          folder = lastAction.args.src.substring(
            0,
            lastAction.args.src.lastIndexOf("/") + 1
          );

        await this.moveFile(`${lastAction.args.dest}/${file}`, folder);
        break;
      case "movedir":
        let dir = lastAction.args.src,
          src = dir.substring(0, dir.lastIndexOf("/"));

        this.moveDir(`${lastAction.args.dest}/${lastAction.args.dirName}`, src);
        break;
      case "writefile":
        if (redo) {
          this.writeFile(lastAction.args.path, "");
          return;
        }
        this.remove(lastAction.args.path);
        break;
      case "rename":
        if (redo) {
          this.rename(lastAction.args.oldPath, lastAction.args.newPath);
          return;
        }
        this.rename(lastAction.args.newPath, lastAction.args.oldPath);

        break;
      case "copy":
        this.remove(lastAction.args.path);
        break;
      case "remove":
        if (redo) {
          this.remove(lastAction.args.path);
          return;
        }
        this.writeFile(lastAction.args.path, lastAction.args.content);
        break;
    }
  };

  resetFileActions() {
    this.actions = [];
    this.undoActions = [];
  }
}
