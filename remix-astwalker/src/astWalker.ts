import { EventEmitter } from "events";
import { AstNodeLegacy, Node, AstNode } from "./index";

export declare interface AstWalker {
  new(): EventEmitter;
}
/**
 * Crawl the given AST through the function walk(ast, callback)
 */
/**
 * visit all the AST nodes
 *
 * @param {Object} ast  - AST node
 * @return EventEmitter
 * event('node', <Node Type | false>) will be fired for every node of type <Node Type>.
 * event('node', "*") will be fired for all other nodes.
 * in each case, if the event emits false it does not descend into children.
 * If no event for the current type, children are visited.
 */
export class AstWalker extends EventEmitter {
  manageCallback(
    node: AstNodeLegacy | AstNode,
    callback: Object | Function
  ): any {
    if (<AstNodeLegacy>node) {
      if ((<AstNodeLegacy>node).name in callback) {
        return callback[(<AstNodeLegacy>node).name](node);
      } else {
        return callback["*"](node);
      }
    }
    if (<AstNode>node) {
      if ((<AstNode>node).nodeType in callback) {
        /* istanbul ignore next */
        return callback[(<AstNode>node).nodeType](node);
      } else {
        /* istanbul ignore next */
        return callback["*"](node);
      }
    }
  }
  walk(ast: AstNodeLegacy | AstNode, callback?: Function | Object) {
    if (callback) {
      if (callback instanceof Function) {
        callback = Object({ "*": callback });
      }
      if (!("*" in callback)) {
        callback["*"] = function() {
          return true;
        };
      }
      if (<AstNodeLegacy>ast) {
        if (
          this.manageCallback(<AstNodeLegacy>ast, callback) &&
          (<AstNodeLegacy>ast).children &&
          (<AstNodeLegacy>ast).children.length > 0
        ) {
          for (let k in (<AstNodeLegacy>ast).children) {
            let child = (<AstNodeLegacy>ast).children[k];
            this.walk(child, callback);
          }
        }
      }
      if (<AstNode>ast) {
        if (
          this.manageCallback(<AstNode>ast, callback) &&
          (<AstNode>ast).nodes &&
          (<AstNode>ast).nodes.length > 0
        ) {
          for (let k in (<AstNode>ast).nodes) {
            let child = (<AstNode>ast).nodes[k];
            this.walk(child, callback);
          }
        }
      }
    } else {
      if (<AstNodeLegacy>ast) {
        if (
          (<AstNodeLegacy>ast).children &&
          (<AstNodeLegacy>ast).children.length > 0
        ) {
          for (let k in (<AstNodeLegacy>ast).children) {
            let child = (<AstNodeLegacy>ast).children[k];
            this.emit("node", child);
            this.walk(child);
          }
        }
      }
      if (<AstNode>ast) {
        if ((<AstNode>ast).nodes && (<AstNode>ast).nodes.length > 0) {
          for (let k in (<AstNode>ast).nodes) {
            let child = (<AstNode>ast).nodes[k];
            this.emit("node", child);
            this.walk(child);
          }
        }
      }
    }
  }

  walkAstList(sourcesList: Node, cb?: Function) {
    if (cb) {
      if (sourcesList.ast) {
        this.walk(sourcesList.ast, cb);
      } else {
        this.walk(sourcesList.legacyAST, cb);
      }
    } else {
      if (sourcesList.ast) {
        this.walk(sourcesList.ast);
      } else {
        this.walk(sourcesList.legacyAST);
      }
    }
  }
}
