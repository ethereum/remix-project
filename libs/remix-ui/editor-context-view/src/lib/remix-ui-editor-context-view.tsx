import React, { useEffect, useState, useRef } from 'react' // eslint-disable-line
import { sourceMappingDecoder } from '@remix-project/remix-debug'

import './remix-ui-editor-context-view.css'

/* eslint-disable-next-line */

export type astNode = {
  name: string,
  id: number,
  children?: Array<any>,
  typeDescriptions: any,
  nodeType: string,
  src: string // e.g "142:1361:0"
}

export type nodePositionLight = {
  file: number,
  length: number,
  start: number
}

export type astNodeLight = {
  fileTarget: string,
  nodeId: number,
  position: nodePositionLight
}

export type onContextListenerChangedListener = (nodes: Array<astNode>) => void
export type ononCurrentFileChangedListener = (name: string) => void

export type gasEstimationType = {
  executionCost: string,
  codeDepositCost: string
}
export interface RemixUiEditorContextViewProps {
  hide: boolean,
  jumpToPosition: (position: any) => void
  onContextListenerChanged: (listener: onContextListenerChangedListener) => void
  onCurrentFileChanged: (listener: ononCurrentFileChangedListener) => void
  getActiveHighlights: () => Array<astNodeLight>
  gasEstimation: (node: astNode) => gasEstimationType
  declarationOf: (node: astNode) => astNode
}

function isDefinition (node: any) {
  return node.nodeType === 'ContractDefinition' ||
    node.nodeType === 'FunctionDefinition' ||
    node.nodeType === 'ModifierDefinition' ||
    node.nodeType === 'VariableDeclaration' ||
    node.nodeType === 'StructDefinition' ||
    node.nodeType === 'EventDefinition'
}

type nullableAstNode = astNode | null

export function RemixUiEditorContextView (props: RemixUiEditorContextViewProps) {
  const loopOverReferences = useRef(0)
  const currentNodeDeclaration = useRef<nullableAstNode>(null)
  const [state, setState] = useState<{
    nodes: Array<astNode>,
    activeHighlights: Array<any>
    gasEstimation: gasEstimationType
  }>({
    nodes: [],
    activeHighlights: [],
    gasEstimation: { executionCost: '', codeDepositCost: '' }
  })

  useEffect(() => {
    props.onCurrentFileChanged(() => {
      currentNodeDeclaration.current = null
      setState(prevState => {
        return { ...prevState, nodes: [], activeHighlights: [] }
      })
    })

    props.onContextListenerChanged(async (nodes: Array<astNode>) => {
      let nextNodeDeclaration
      let nextNode
      if (!props.hide && nodes && nodes.length) {
        nextNode = nodes[nodes.length - 1]
        if (!isDefinition(nextNode)) {
          nextNodeDeclaration = await props.declarationOf(nextNode)
        } else {
          nextNodeDeclaration = nextNode
        }
      }
      //console.log(nextNode, nextNodeDeclaration)
      if (nextNodeDeclaration && currentNodeDeclaration.current && nextNodeDeclaration.id === currentNodeDeclaration.current.id) return

      currentNodeDeclaration.current = nextNodeDeclaration

      let gasEstimation
      if (currentNodeDeclaration.current) {
        if (currentNodeDeclaration.current.nodeType === 'FunctionDefinition') {
          gasEstimation = await props.gasEstimation(currentNodeDeclaration.current)
        }
      }
      const activeHighlights: Array<astNodeLight> = await props.getActiveHighlights()
      // console.log('active highlights', activeHighlights)
      if (nextNode && activeHighlights && activeHighlights.length) {
        loopOverReferences.current = activeHighlights.findIndex((el: astNodeLight) => `${el.position.start}:${el.position.length}:${el.position.file}` === nextNode.src)
        loopOverReferences.current = loopOverReferences.current === -1 ? 0 : loopOverReferences.current
      } else {
        loopOverReferences.current = 0
      }
      setState(prevState => {
        return { ...prevState, nodes, activeHighlights, gasEstimation }
      })
    })
  }, [])

  /*
   * show gas estimation
   */
  const gasEstimation = (node) => {
    if (node.nodeType === 'FunctionDefinition' && state && state.gasEstimation) {
      const result: gasEstimationType = state.gasEstimation
      const executionCost = ' Execution cost: ' + result.executionCost + ' gas'
      const codeDepositCost = 'Code deposit cost: ' + result.codeDepositCost + ' gas'
      const estimatedGas = result.codeDepositCost ? `${codeDepositCost}, ${executionCost}` : `${executionCost}`
      return (
        <div className="gasEstimation">
          <i className="fas fa-gas-pump gasStationIcon" title='Gas estimation'></i>
          <span>{estimatedGas}</span>
        </div>
      )
    } else {
      return (<div></div>)
    }
  }



  const _render = () => {
    const node = currentNodeDeclaration.current
    if (!node) return (<div></div>)
    const references = state.activeHighlights
    // console.log(node)
    const type = node.typeDescriptions && node.typeDescriptions.typeString ? node.typeDescriptions.typeString : node.nodeType
    const referencesCount = `${references ? references.length : '0'} reference(s)`

    const nodes: Array<astNodeLight> = state.activeHighlights

    const jumpTo = () => {
      if (node && node.src) {
        // console.log(node)
        const position = sourceMappingDecoder.decode(node.src)
        if (position) {
          props.jumpToPosition(position)
        }
      }
    }

    // JUMP BETWEEN REFERENCES
    const jump = (e: any) => {
      e.target.dataset.action === 'next' ? loopOverReferences.current++ : loopOverReferences.current--
      if (loopOverReferences.current < 0) loopOverReferences.current = nodes.length - 1
      if (loopOverReferences.current >= nodes.length) loopOverReferences.current = 0
      console.log(loopOverReferences.current)
      props.jumpToPosition(nodes[loopOverReferences.current].position)
    }

    return (
      <div className="line">{gasEstimation(node)}
        <div title={type} className="type">{type}</div>
        <div title={node.name} className="name mr-2">{node.name}</div>
        <i className="fas fa-share jump" data-action='gotoref' aria-hidden="true" onClick={jumpTo}></i>
        <span className="referencesnb">{referencesCount}</span>
        <i data-action='previous' className="fas fa-chevron-up jump" aria-hidden="true" onClick={jump}></i>
        <i data-action='next' className="fas fa-chevron-down jump" aria-hidden="true" onClick={jump}></i>
      </div>
    )
  }

  return (
    !props.hide && <div className="container-context-view contextviewcontainer bg-light text-dark border-0 py-1">
      {_render()}
    </div>
  )
}

export default RemixUiEditorContextView
