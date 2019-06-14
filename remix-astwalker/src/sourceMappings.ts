import { AstWalker } from './astWalker';
import { AstNode, Location } from "./index";

/**
 * Break out fields of an AST's "src" attribute string (s:l:f)
 * into its "start", "length", and "file index" components.
 *
 * @param {AstNode} astNode  - the object to convert.
 */
export function sourceLocationFromAstNode(astNode: AstNode): Location | null {
  if (astNode.src) {
    var split = astNode.src.split(':')
    return <Location>{
      start: parseInt(split[0], 10),
      length: parseInt(split[1], 10),
      file: parseInt(split[2], 10)
    }
  }
  return null;
}

/**
 * Routines for retrieving AST object(s) using some criteria, usually
 * includng "src' information.
 */
export class SourceMappings {

  readonly source: string;
  readonly lineBreaks: Array<number>;

  constructor(source: string) {
    this.source = source;
    this.lineBreaks = this.getLinebreakPositions();
  };

  /**
   * get a list of nodes that are at the given @arg offset
   *
   * @param {String} astNodeType - type of node to return or null
   * @param {Int} position     - character offset
   * @return {Object} ast object given by the compiler
   */
  nodesAtPosition(astNodeType: string | null, position: number, ast: AstNode): Array<AstNode> {
    const astWalker = new AstWalker()
    const callback = {}
    let found: Array<AstNode> = [];

    /* FIXME: Looking at AST walker code,
       I don't understand a need to return a boolean. */
    callback['*'] = function(node: AstNode): boolean {
      let nodeLocation = sourceLocationFromAstNode(node);
      if (nodeLocation &&
        nodeLocation.start <= position &&
        nodeLocation.start + nodeLocation.length >= position) {
        if (!astNodeType || astNodeType === node.name) {
          found.push(node)
        }
      }
      return true;
    }
    astWalker.walk(ast, callback);
    return found;
  }

  /**
   * Retrieve line/column position of each source char
   *
   * @param {String} source - contract source code
   * @return {Array} returns an array containing offset of line breaks
   */
  getLinebreakPositions(source: string = this.source): Array<number> {
    let ret: Array<number> = [];
    for (var pos = source.indexOf('\n'); pos >= 0; pos = source.indexOf('\n', pos + 1)) {
      ret.push(pos)
    }
    return ret;
  }

  findNodeAtSourceLocation(astNodeType: string, sourceLocation: Location, ast: AstNode | null) {
    const astWalker = new AstWalker()
    const callback = {};
    let found = null;
    /* FIXME: Looking at AST walker code,
       I don't understand a need to return a boolean. */
    callback['*'] = function(node: AstNode) {
      let nodeLocation = sourceLocationFromAstNode(node);
      if (nodeLocation &&
        nodeLocation.start <= sourceLocation.start &&
        nodeLocation.start + nodeLocation.length >= sourceLocation.start + sourceLocation.length) {
        if (astNodeType === node.nodeType) {
          found = node;
        }
      }
      return true;
    }

    astWalker.walkFull(ast, callback);
    return found;
  }
}

module.exports = {
  SourceMappings,
  sourceLocationFromAstNode
};
