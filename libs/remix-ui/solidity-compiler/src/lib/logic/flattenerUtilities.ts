import type { CompilationSource, AstNode } from '@remix-project/remix-solidity'

const IMPORT_SOLIDITY_REGEX = /^\s*import(\s+).*$/gm
const SPDX_SOLIDITY_REGEX = /^\s*\/\/ SPDX-License-Identifier:.*$/gm
const PRAGMA_SOLIDITY_REGEX = /^pragma experimental\s+.*$/gm

type Visited = { [key: string]: number }
export function getDependencyGraph(ast: { [name: string]: CompilationSource }, target: string, remappings: string[], order: string[]) {
  const graph = tsort()
  const visited = {}
  visited[target] = 1
  _traverse(graph, visited, ast, target, remappings, order)
  return graph
}

export function concatSourceFiles(files: any[], sources: any, order: string[]) {
  let concat = ''
  order.forEach((importName) => {
    for (const file of files) {
      if (file === importName) {
        const source = sources[file].content
        const sourceWithoutImport = source.replace(IMPORT_SOLIDITY_REGEX, '')
        const sourceWithoutSPDX = sourceWithoutImport.replace(SPDX_SOLIDITY_REGEX, '')
        const sourceWithoutDuplicatePragma = sourceWithoutSPDX.replace(PRAGMA_SOLIDITY_REGEX, '')
        concat += `\n// File: ${file}\n\n`
        concat += sourceWithoutDuplicatePragma
      }
    }
  })
  return concat
}

function _traverse(graph: Graph, visited: Visited, ast: { [name: string]: CompilationSource }, name: string, remappings: string[], order: string[]) {
  let currentAst = null
  currentAst = ast[name].ast
  const dependencies = _getDependencies(currentAst)
  for (const dependency of dependencies) {
    const path = resolve(name, dependency, remappings)
    if (path in visited) {
      continue; // fixes wrong ordering of source in flattened file
    }
    visited[path] = 1
    graph.add(name, path)
    _traverse(graph, visited, ast, path, remappings, order)
  }
  order.push(name)
}

function _getDependencies(ast: AstNode) {
  const dependencies = ast?.nodes
    .filter(node => node?.nodeType === 'ImportDirective')
    .map(node => node?.file);
  return dependencies;
}

// TSORT

function tsort(initial?: any): Graph {
  const graph = new Graph();

  if (initial) {
    initial.forEach(function (entry) {
      Graph.prototype.add.apply(graph, entry);
    });
  }

  return graph;
}

class Graph {
  nodes: { [key: string]: any}
  constructor() {
    this.nodes = {}
  }

  // Add sorted items to the graph
  add (name, path) {
    const self = this;
    // eslint-disable-next-line prefer-rest-params
    let items = [].slice.call(arguments);

    if (items.length === 1 && Array.isArray(items[0]))
      items = items[0];

    items.forEach(function (item) {
      if (!self.nodes[item]) {
        self.nodes[item] = [];
      }
    });

    for (let i = 1; i < items.length; i++) {
      const from = items[i];
      const to = items[i - 1];

      self.nodes[from].push(to);
    }

    return self;
  }

  // Depth first search
  // As given in http://en.wikipedia.org/wiki/Topological_sorting
  sort () {
    const self = this;
    const nodes = Object.keys(this.nodes);

    const sorted = [];
    const marks = {};

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if (!marks[node]) {
        visit(node);
      }
    }

    return sorted;

    function visit(node) {
      if (marks[node] === 'temp')
        throw new Error("There is a cycle in the graph. It is not possible to derive a topological sort.");
      else if (marks[node])
        return;

      marks[node] = 'temp';
      self.nodes[node].forEach(visit);
      marks[node] = 'perm';

      sorted.push(node);
    }
  }

  isEmpty () {
    const nodes = Object.keys(this.nodes);
    return nodes.length === 0;
  }
}

// PATH

function resolve(parentPath, childPath, remappings: string[]) {
  if (remappings && remappings.length) {
    for (const mapping of remappings) {
      if (mapping.indexOf('=') !== -1) {
        const split = mapping.split('=')
        childPath = childPath.replace(split[0].trim(), split[1].trim())
      }
    }
  }

  if (_isAbsolute(childPath)) {
    return childPath;
  }
  const path = parentPath + '/../' + childPath;
  const pathParts = path.split('/');
  const resolvedParts = _resolvePathArray(pathParts);
  const resolvedPath = resolvedParts
    .join('/')
    .replace('http:/', 'http://')
    .replace('https:/', 'https://');
  return resolvedPath;
}

function _isAbsolute(path) {
  return path[0] !== '.';
}

function _resolvePathArray(parts) {
  const res = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];

    // ignore empty parts
    if (!p || p === '.')
      continue;

    if (p === '..') {
      if (res.length && res[res.length - 1] !== '..') {
        res.pop();
      }
    } else {
      res.push(p);
    }
  }

  return res;
}

export function normalizeContractPath(contractPath: string): string[] {
  const paths = contractPath.split('/')
  const filename = paths[paths.length - 1].split('.')[0]
  let folders = ''
  for (let i = 0; i < paths.length - 1; i++) {
    if (i !== paths.length -1) {
      folders += `${paths[i]}/`
    }
  }
  const resultingPath = `${folders}${filename}`
  return [folders,resultingPath, filename]
}
