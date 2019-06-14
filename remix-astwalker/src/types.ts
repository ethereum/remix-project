export interface Location {
  start: number;
  length: number;
  file: number;  // Would it be clearer to call this a file index?
}

export interface Node {
  ast?: AstNode;
  legacyAST?: AstNodeLegacy;
  source?: string;
  id?: number;
}

export interface AstNode {
  /* The following fields are essential, and indicates an that object
     is an AST node. */
  id: number;  // This is unique across all nodes in an AST tree
  nodeType: string;
  src: string;

  absolutePath?: string;
  exportedSymbols?: Object;
  nodes?: Array<AstNode>;
  literals?: Array<string>;
  file?: string;
  scope?: number;
  sourceUnit?: number;
  symbolAliases?: Array<string>;
  [x: string]: any;
}

export interface AstNodeLegacy {
  id: number;
  name: string;  // This corresponds to nodeType in current AST
  src: string;
  children?: Array<AstNodeLegacy>;  // This corresponds to nodes in current AST
  attributes?: AstNodeAtt;
}

export interface AstNodeAtt {
  operator?: string;
  string?: null;
  type?: string;
  value?: string;
  constant?: boolean;
  name?: string;
  public?: boolean;
  exportedSymbols?: Object;
  argumentTypes?: null;
  absolutePath?: string;
  [x: string]: any;
}
