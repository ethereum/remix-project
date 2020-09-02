'use strict'
const tape = require('tape')
const AstWalker = require('../src/source/astWalker')
const node = require('./resources/ast')

tape('ASTWalker', function (t) {
  t.test('ASTWalker.walk', function (st) {
    st.plan(24)
    const astwalker = new AstWalker()

    astwalker.walk(node.ast.ast, function (node) {
      if (node.nodeType === 'ContractDefinition') {
        checkContract(st, node)
      }
      if (node.nodeType === 'FunctionDefinition') {
        checkSetFunction(st, node)
      }
      return true
    })

    const callback = {}
    callback.FunctionDefinition = function (node) {
      st.equal(node.nodeType, 'FunctionDefinition')
      st.equal(node.name === 'set' || node.name === 'get', true)
      return true
    }
    astwalker.walk(node.ast.ast, callback)
  })
})

function checkContract (st, node) {
  st.equal(node.name, 'test')
  st.equal(node.nodes[0].name, 'x')
  st.equal(node.nodes[0].typeDescriptions.typeString, 'int256')
  st.equal(node.nodes[1].name, 'y')
  st.equal(node.nodes[1].typeDescriptions.typeString, 'int256')
  st.equal(node.nodes[2].nodeType, 'FunctionDefinition')
  st.equal(node.nodes[2].stateMutability, 'nonpayable')
  st.equal(node.nodes[2].name, 'set')
  st.equal(node.nodes[2].visibility, 'public')
}

function checkSetFunction (st, node) {
  if (node.name === 'set') {
    st.equal(node.parameters.nodeType, 'ParameterList')
    st.equal(node.returnParameters.nodeType, 'ParameterList')
    st.equal(node.body.nodeType, 'Block')
    st.equal(node.body.statements[0].nodeType, 'ExpressionStatement')
    checkExpressionStatement(st, node.body.statements[0])
  }
}

function checkExpressionStatement (st, node) {
  st.equal(node.expression.nodeType, 'Assignment')
  st.equal(node.expression.operator, '=')
  st.equal(node.expression.typeDescriptions.typeString, 'int256')
  st.equal(node.expression.leftHandSide.nodeType, 'Identifier')
  st.equal(node.expression.leftHandSide.name, 'x')
  st.equal(node.expression.rightHandSide.nodeType, 'Identifier')
  st.equal(node.expression.rightHandSide.name, '_x')
}
