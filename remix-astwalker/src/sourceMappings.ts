import { isAstNode, AstWalker } from './astWalker';
import { AstNode, Location } from "./types";

export declare interface SourceMappings {
  new(): SourceMappings;
}

/**
 * Break out fields of an AST's "src" attribute string (s:l:f)
 * into its "start", "length", and "file index" components.
 *
 * @param {AstNode} astNode  - the object to convert.
 */
export function sourceLocationFromAstNode(astNode: AstNode): Location | null {
  if (isAstNode(astNode) && astNode.src) {
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

    // Create a list of line offsets which will be used to map between
    // character offset and line/column positions.
    let lineBreaks: Array<number> = [];
    for (var pos = source.indexOf('\n'); pos >= 0; pos = source.indexOf('\n', pos + 1)) {
      lineBreaks.push(pos)
    }
    this.lineBreaks = lineBreaks;
  };

  /**
   * get a list of nodes that are at the given @arg position
   *
   * @param {String} astNodeType - type of node to return or null
   * @param {Int} position     - character offset
   * @return {Object} ast object given by the compiler
   */
  nodesAtPosition(astNodeType: string | null, position: Location, ast: AstNode): Array<AstNode> {
    const astWalker = new AstWalker()
    let found: Array<AstNode> = [];

    const callback = function(node: AstNode): boolean {
      let nodeLocation = sourceLocationFromAstNode(node);
      if (nodeLocation &&
        nodeLocation.start == position.start &&
        nodeLocation.length == position.length) {
        if (!astNodeType || astNodeType === node.nodeType) {
          found.push(node)
        }
      }
      return true;
    }
    astWalker.walkFull(ast, callback);
    return found;
  }

  findNodeAtSourceLocation(astNodeType: string | undefined, sourceLocation: Location, ast: AstNode | null): AstNode | null {
    const astWalker = new AstWalker()
    let found = null;
    /* FIXME: Looking at AST walker code,
       I don't understand a need to return a boolean. */
    const callback = function(node: AstNode) {
      let nodeLocation = sourceLocationFromAstNode(node);
      if (nodeLocation &&
        nodeLocation.start == sourceLocation.start &&
        nodeLocation.length == sourceLocation.length) {
        if (astNodeType == undefined || astNodeType === node.nodeType) {
          found = node;
        }
      }
      return true;
    }

    astWalker.walkFull(ast, callback);
    return found;
  }
}
