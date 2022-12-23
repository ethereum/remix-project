const IMPORT_SOLIDITY_REGEX = /^\s*import(\s+).*$/gm;
const SPDX_SOLIDITY_REGEX = /^\s*\/\/ SPDX-License-Identifier:.*$/gm;

export function getDependencyGraph(ast, target) {
	const graph = tsort();
	const visited = {};
	visited[target] = 1;
	_traverse(graph, visited, ast, target);
	return graph;
}

export function concatSourceFiles(files, sources) {

	let concat = '';
	for (const file of files) {
		const source = sources[file].content;
		const sourceWithoutImport = source.replace(IMPORT_SOLIDITY_REGEX, '');
		const sourceWithoutSPDX = sourceWithoutImport.replace(SPDX_SOLIDITY_REGEX, '');
		concat += `\n// File: ${file}\n\n`;
		concat += sourceWithoutSPDX;
	}
	return concat;
}

function _traverse(graph, visited, ast, name) {
	const currentAst = ast[name].ast;
	const dependencies = _getDependencies(currentAst);
	for (const dependency of dependencies) {
		const path = resolve(name, dependency);
		if (path in visited) {
			continue;
		}
		visited[path] = 1;
		graph.add(name, path);
		_traverse(graph, visited, ast, path);
	}
}

function _getDependencies(ast) {
	const dependencies = ast.nodes
		.filter(node => node.nodeType === 'ImportDirective')
		.map(node => node.file);
	return dependencies;
}


// TSORT

function tsort(initial?: any) {
	const graph = new Graph();

	if (initial) {
		initial.forEach(function (entry) {
			Graph.prototype.add.apply(graph, entry);
		});
	}

	return graph;
}


function Graph() {
	this.nodes = {};
}

// Add sorted items to the graph
Graph.prototype.add = function () {
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
};

// Depth first search
// As given in http://en.wikipedia.org/wiki/Topological_sorting
Graph.prototype.sort = function () {
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
};

Graph.prototype.isEmpty = function () {
	const nodes = Object.keys(this.nodes);
	return nodes.length === 0;
}


// PATH

function resolve(parentPath, childPath) {
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