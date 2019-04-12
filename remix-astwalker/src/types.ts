export interface Node {
  ast?: AstNode;
  legacyAST?: AstNodeLegacy;
  source?: string;
  id?: number;
}

export interface AstNode {
  absolutePath?: string;
  exportedSymbols?: Object;
  id: number;
  nodeType: string;
  nodes?: Array<AstNode>;
  src: string;
  literals?: Array<string>;
  file?: string;
  scope?: number;
  sourceUnit?: number;
  symbolAliases?: Array<string>;
  [x: string]: any;
}

export interface AstNodeLegacy {
  id: number;
  name: string;
  src: string;
  children?: Array<AstNodeLegacy>;
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
