import { EventEmitter } from 'events'
import { Node, AstNode } from './index'

export declare interface AstWalker {
  new(): EventEmitter;
}

const isObject = function (obj: any): boolean {
  return obj != null && obj.constructor.name === 'Object'
}

export function isAstNode (node: Record<string, unknown>): boolean {
  return (
    isObject(node) &&
    'id' in node &&
    'nodeType' in node &&
    'src' in node
  )
}

export function isYulAstNode (node: Record<string, unknown>): boolean {
  return (
    isObject(node) &&
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
// eslint-disable-next-line no-redeclare
export class AstWalker extends EventEmitter {
  manageCallback (
    node: AstNode,
    callback: Record<string, unknown> | Function // eslint-disable-line @typescript-eslint/ban-types
  ): any {
    // FIXME: we shouldn't be doing this callback determination type on each AST node,
    // since the callback function is set once per walk.
    // Better would be to store the right one as a variable and
    // return that.
    if (node) {
      if ((node).name in callback) {
        return callback[(node).name](node)
      } else {
        return callback['*'](node)
      }
    }
    if (<AstNode>node) {
      if ((<AstNode>node).nodeType in callback) {
        /* istanbul ignore next */
        return callback[(<AstNode>node).nodeType](node)
      } else {
        /* istanbul ignore next */
        return callback['*'](node)
      }
    }
  }

  normalizeNodes (nodes: AstNode[]): AstNode[] {
    // Remove null, undefined and empty elements if any
    nodes = nodes.filter(e => e)

    // If any element in nodes is array, extract its members
    const objNodes = []
    nodes.forEach(x => {
      if (Array.isArray(x)) objNodes.push(...x)
      else objNodes.push(x)
    })

    // Filter duplicate nodes using id field
    const normalizedNodes = []
    objNodes.forEach((element) => {
      const firstIndex = normalizedNodes.findIndex(e => e.id === element.id)
      if (firstIndex === -1) normalizedNodes.push(element)
    })
    return normalizedNodes
  }

  getASTNodeChildren (ast: AstNode): AstNode[] {
    let nodes = ast.nodes || // for ContractDefinition
              ast.body || // for FunctionDefinition, ModifierDefinition, WhileStatement, DoWhileStatement, ForStatement
              ast.statements || // for Block, YulBlock
              ast.members || // for StructDefinition, EnumDefinition
              ast.overrides || // for OverrideSpecifier
              ast.parameters || // for ParameterList, EventDefinition
              ast.declarations || // for VariableDeclarationStatement
              ast.expression || // for Return, ExpressionStatement, FunctionCall, FunctionCallOptions, MemberAccess
              ast.components || // for TupleExpression
              ast.subExpression || // for UnaryOperation
              ast.eventCall || // for EmitStatement
              []

    // If 'nodes' is not an array, convert it into one, for example: ast.body
    if (nodes && !Array.isArray(nodes)) {
      const tempArr = []
      tempArr.push(nodes)
      nodes = tempArr
    }

    // To break object referencing
    nodes = [...nodes]

    if (ast.nodes && ast.baseContracts?.length) { // for ContractDefinition
      nodes.push(...ast.baseContracts)
    } else if (ast.body && ast.overrides && ast.parameters && ast.returnParameters && ast.modifiers) { // for FunctionDefinition
      nodes.push(ast.overrides)
      nodes.push(ast.parameters)
      nodes.push(ast.returnParameters)
      nodes.push(ast.modifiers)
    } else if (ast.typeName) { // for VariableDeclaration, NewExpression, ElementaryTypeNameExpression
      nodes.push(ast.typeName)
    } else if (ast.body && ast.overrides && ast.parameters) { // for ModifierDefinition
      nodes.push(ast.overrides)
      nodes.push(ast.parameters)
    } else if (ast.modifierName && ast.arguments) { // for ModifierInvocation
      nodes.push(ast.modifierName)
      nodes.push(ast.arguments)
    } else if (ast.parameterTypes && ast.returnParameterTypes) { // for ModifierInvocation
      nodes.push(ast.parameterTypes)
      nodes.push(ast.returnParameterTypes)
    } else if (ast.keyType && ast.valueType) { // for Mapping
      nodes.push(ast.keyType)
      nodes.push(ast.valueType)
    } else if (ast.baseType && ast.length) { // for ArrayTypeName
      nodes.push(ast.baseType)
      nodes.push(ast.length)
    } else if (ast.AST) { // for InlineAssembly
      nodes.push(ast.AST)
    } else if (ast.condition && (ast.trueBody || ast.falseBody || ast.body)) { // for IfStatement, WhileStatement, DoWhileStatement
      nodes.push(ast.condition)
      nodes.push(ast.trueBody)
      nodes.push(ast.falseBody)
    } else if (ast.parameters && ast.block) { // for TryCatchClause
      nodes.push(ast.block)
    } else if (ast.externalCall && ast.clauses) { // for TryStatement
      nodes.push(ast.externalCall)
      nodes.push(ast.clauses)
    } else if (ast.body && ast.condition && ast.initializationExpression && ast.loopExpression) { // for ForStatement
      nodes.push(ast.condition)
      nodes.push(ast.initializationExpression)
      nodes.push(ast.loopExpression)
    } else if (ast.declarations && ast.initialValue) { // for VariableDeclarationStatement
      nodes.push(ast.initialValue)
    } else if (ast.condition && (ast.trueExpression || ast.falseExpression)) { // for Conditional
      nodes.push(ast.condition)
      nodes.push(ast.trueExpression)
      nodes.push(ast.falseExpression)
    } else if (ast.leftHandSide && ast.rightHandSide) { // for Assignment
      nodes.push(ast.leftHandSide)
      nodes.push(ast.rightHandSide)
    } else if (ast.leftExpression && ast.rightExpression) { // for BinaryOperation
      nodes.push(ast.leftExpression)
      nodes.push(ast.rightExpression)
    } else if (ast.expression && (ast.arguments || ast.options)) { // for FunctionCall, FunctionCallOptions
      nodes.push(ast.arguments ? ast.arguments : ast.options)
    } else if (ast.baseExpression && (ast.indexExpression || (ast.startExpression && ast.endExpression))) { // for IndexAccess, IndexRangeAccess
      nodes.push(ast.baseExpression)
      if (ast.indexExpression) nodes.push(ast.indexExpression)
      else {
        nodes.push(ast.startExpression)
        nodes.push(ast.endExpression)
      }
    }
    return this.normalizeNodes(nodes)
  }

  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/explicit-module-boundary-types
  walk (ast: AstNode, callback?: Function | Record<string, unknown>) {
    if (ast) {
      const children: AstNode[] = this.getASTNodeChildren(ast)
      if (callback) {
        if (callback instanceof Function) {
          callback = Object({ '*': callback })
        }
        if (!('*' in callback)) {
          callback['*'] = function () {
            return true
          }
        }
        if (this.manageCallback(ast, callback) && children?.length) {
          for (const k in children) {
            const child = children[k]
            this.walk(child, callback)
          }
        }
      } else {
        if (children?.length) {
          for (const k in children) {
            const child = children[k]
            this.emit('node', child)
            this.walk(child)
          }
        }
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/explicit-module-boundary-types
  walkFullInternal (ast: AstNode, callback: Function) {
    if (isAstNode(ast) || isYulAstNode(ast)) {
      // console.log(`XXX id ${ast.id}, nodeType: ${ast.nodeType}, src: ${ast.src}`);
      callback(ast)
      for (const k of Object.keys(ast)) {
        // Possible optimization:
        // if (k in ['id', 'src', 'nodeType']) continue;
        const astItem = ast[k]
        if (Array.isArray(astItem)) {
          for (const child of astItem) {
            if (child) {
              this.walkFullInternal(child, callback)
            }
          }
        } else {
          this.walkFullInternal(astItem, callback)
        }
      }
    }
  }

  // Normalizes parameter callback and calls walkFullInternal
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  walkFull (ast: AstNode, callback: any) {
    if (isAstNode(ast) || isYulAstNode(ast)) return this.walkFullInternal(ast, callback)
  }

  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/explicit-module-boundary-types
  walkAstList (sourcesList: Node, cb?: Function) {
    if (cb) {
      if (sourcesList.ast) {
        this.walk(sourcesList.ast, cb)
      }
    } else {
      if (sourcesList.ast) {
        this.walk(sourcesList.ast)
      }
    }
  }
}
