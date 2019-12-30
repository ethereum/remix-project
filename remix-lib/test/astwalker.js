'use strict'
const tape = require('tape')
const AstWalker = require('../src/astWalker')
const node = require('./resources/ast')

tape('ASTWalker', function (t) {
  t.test('ASTWalker.walk', function (st) {
    st.plan(24)
    const astwalker = new AstWalker()

    astwalker.walk(node.ast.legacyAST, function (node) {
      if (node.name === 'ContractDefinition') {
        checkContract(st, node)
      }
      if (node.name === 'FunctionDefinition') {
        checkSetFunction(st, node)
      }
      return true
    })

    const callback = {}
    callback.FunctionDefinition = function (node) {
      st.equal(node.name, 'FunctionDefinition')
      st.equal(node.attributes.name === 'set' || node.attributes.name === 'get', true)
      return true
    }
    astwalker.walk(node.ast.legacyAST, callback)
  })
})

function checkContract (st, node) {
  st.equal(node.attributes.name, 'test')
  st.equal(node.children[0].attributes.name, 'x')
  st.equal(node.children[0].attributes.type, 'int256')
  st.equal(node.children[1].attributes.name, 'y')
  st.equal(node.children[1].attributes.type, 'int256')
  st.equal(node.children[2].name, 'FunctionDefinition')
  st.equal(node.children[2].attributes.constant, false)
  st.equal(node.children[2].attributes.name, 'set')
  st.equal(node.children[2].attributes.public, true)
}

function checkSetFunction (st, node) {
  if (node.attributes.name === 'set') {
    st.equal(node.children[0].name, 'ParameterList')
    st.equal(node.children[1].name, 'ParameterList')
    st.equal(node.children[2].name, 'Block')
    st.equal(node.children[2].children[1].name, 'ExpressionStatement')
    checkExpressionStatement(st, node.children[2].children[0])
  }
}

function checkExpressionStatement (st, node) {
  st.equal(node.children[0].name, 'Assignment')
  st.equal(node.children[0].attributes.operator, '=')
  st.equal(node.children[0].attributes.type, 'int256')
  st.equal(node.children[0].children[0].name, 'Identifier')
  st.equal(node.children[0].children[0].attributes.value, 'x')
  st.equal(node.children[0].children[1].name, 'Identifier')
  st.equal(node.children[0].children[1].attributes.value, '_x')
}
