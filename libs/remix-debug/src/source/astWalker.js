'use strict'
/**
 * Crawl the given AST through the function walk(ast, callback)
 */
function AstWalker () {} // eslint-disable-line

/**
 * visit all the AST nodes
 *
 * @param {Object} ast  - AST node
 * @param {Object or Function} callback  - if (Function) the function will be called for every node.
 *                                       - if (Object) callback[<Node Type>] will be called for
 *                                         every node of type <Node Type>. callback["*"] will be called for all other nodes.
 *                                         in each case, if the callback returns false it does not descend into children.
 *                                         If no callback for the current type, children are visited.
 */
AstWalker.prototype.walk = function (ast, callback) {
  if (callback instanceof Function) {
    callback = { '*': callback }
  }
  if (!('*' in callback)) {
    callback['*'] = function () { return true }
  }
  const nodes = ast.nodes || (ast.body && ast.body.statements) || ast.declarations || ast.statements
  if (nodes && ast.initializationExpression) { // 'for' loop handling
    nodes.push(ast.initializationExpression)
  }
  if (manageCallBack(ast, callback) && nodes && nodes.length > 0) {
    for (let k in nodes) {
      const child = nodes[k]
      this.walk(child, callback)
    }
  }
}

/**
 * walk the given @astList
 *
 * @param {Object} sourcesList - sources list (containing root AST node)
 * @param {Function} - callback used by AstWalker to compute response
 */
AstWalker.prototype.walkAstList = function (sourcesList, callback) {
  const walker = new AstWalker()
  for (let k in sourcesList) {
    walker.walk(sourcesList[k].ast, callback)
  }
}

function manageCallBack (node, callback) {
  if (node.nodeType in callback) {
    return callback[node.nodeType](node)
  } else {
    return callback['*'](node)
  }
}

module.exports = AstWalker
