import { EventEmitter } from "events";
import { AstNodeLegacy, Node, AstNode } from "./index";

export declare interface AstWalker {
  new(): EventEmitter;
}

const isObject = function(obj: any): boolean {
  return obj != null && obj.constructor.name === "Object"
}

export function isAstNode(node: Record<string, unknown>): boolean {
  return (
    isObject(node) &&
    'id' in node &&
    'nodeType' in node &&
    'src' in node
  )
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
    callback: Record<string, unknown> | Function // eslint-disable-line @typescript-eslint/ban-types
  ): any {
    // FIXME: we shouldn't be doing this callback determination type on each AST node,
    // since the callback function is set once per walk.
    // Better would be to store the right one as a variable and
    // return that.
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

  getASTNodeChildren(ast: AstNode): AstNode[] {
    const nodes = ast.nodes || (ast.body && ast.body.statements) || ast.declarations || []
    if (ast.body && ast.initializationExpression) { // 'for' loop handling
      nodes.push(ast.initializationExpression)
    }
    return nodes
  }
  
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/explicit-module-boundary-types
  walk(ast: AstNode, callback?: Function | Record<string, unknown>) {
    if (ast) {
      const children: AstNode[] = this.getASTNodeChildren(ast)
      if (callback) {
        if (callback instanceof Function) {
          callback = Object({ "*": callback });
        }
        if (!("*" in callback)) {
          callback["*"] = function() {
            return true;
          };
        }
        if (this.manageCallback(ast, callback) && children?.length) {
          for (const k in children) {
            const child = children[k];
            this.walk(child, callback);
          }
        }
        } else {
          if (children?.length) {
            for (const k in children) {
              const child = children[k];
              this.emit("node", child);
              this.walk(child);
            }
          }
        }
    }
  }
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/explicit-module-boundary-types
  walkFullInternal(ast: AstNode, callback: Function) {

    if (isAstNode(ast)) {
      // console.log(`XXX id ${ast.id}, nodeType: ${ast.nodeType}, src: ${ast.src}`);
      callback(ast);
      for (const k of Object.keys(ast)) {
        // Possible optimization:
        // if (k in ['id', 'src', 'nodeType']) continue;
        const astItem = ast[k];
        if (Array.isArray(astItem)) {
          for (const child of astItem) {
            if (child) {
              this.walkFullInternal(child, callback);
            }
          }
        } else {
          this.walkFullInternal(astItem, callback);
        }
      }
    }
  }

  // Normalizes parameter callback and calls walkFullInternal
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  walkFull(ast: AstNode, callback: any) {
    if (!isAstNode(ast)) throw new TypeError("first argument should be an ast");
    return this.walkFullInternal(ast, callback);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/explicit-module-boundary-types
  walkAstList(sourcesList: Node, cb?: Function) {
    if (cb) {
      if (sourcesList.ast) {
        this.walk(sourcesList.ast, cb);
      }
    } else {
      if (sourcesList.ast) {
        this.walk(sourcesList.ast);
      }
    }
  }
}
