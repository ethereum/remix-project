
import {  Monaco } from '@monaco-editor/react'
import React from 'react'
import { sourceAnnotation, sourceMarker, lineText } from "../types"

export const convertToMonacoDecoration = (decoration: lineText | sourceAnnotation | sourceMarker, typeOfDecoration: string, monacoRef: React.MutableRefObject<Monaco>) => {
  if (typeOfDecoration === 'sourceAnnotationsPerFile') {
    decoration = decoration as sourceAnnotation
    return {
      type: typeOfDecoration,
      range: new monacoRef.current.Range(decoration.row + 1, 1, decoration.row + 1, 1),
      options: {
        isWholeLine: false,
        glyphMarginHoverMessage: { value: (decoration.from ? `from ${decoration.from}:\n` : '') + decoration.text },
        glyphMarginClassName: `fal fa-exclamation-square text-${decoration.type === 'error' ? 'danger' : (decoration.type === 'warning' ? 'warning' : 'info')}`
      }
    }
  }
  if (typeOfDecoration === 'markerPerFile') {
    decoration = decoration as sourceMarker
    let isWholeLine = false
    if ((decoration.position.start.line === decoration.position.end.line && decoration.position.end.column - decoration.position.start.column < 2) ||
      (decoration.position.start.line !== decoration.position.end.line)) {
      // in this case we force highlighting the whole line (doesn't make sense to highlight 2 chars)
      isWholeLine = true
    }
    return {
      type: typeOfDecoration,
      range: new monacoRef.current.Range(decoration.position.start.line + 1, decoration.position.start.column + 1, decoration.position.end.line + 1, decoration.position.end.column + 1),
      options: {
        isWholeLine,
        inlineClassName: `${isWholeLine ? 'alert-info' : 'inline-class'}  border-0 highlightLine${decoration.position.start.line + 1}`
      }
    }
  }
  if (typeOfDecoration === 'lineTextPerFile') {
    const lineTextDecoration = decoration as lineText
    return {
      type: typeOfDecoration,
      range: new monacoRef.current.Range(lineTextDecoration.position.start.line + 1, lineTextDecoration.position.start.column + 1, lineTextDecoration.position.start.line + 1, 1024),
      options: {
        after: { content: ` ${lineTextDecoration.content}`, inlineClassName: `${lineTextDecoration.className}` },
        afterContentClassName: `${lineTextDecoration.afterContentClassName}`,
        hoverMessage : lineTextDecoration.hoverMessage
      },

    }
  }
  if (typeOfDecoration === 'lineTextPerFile') {
    const lineTextDecoration = decoration as lineText
    return {
      type: typeOfDecoration,
      range: new monacoRef.current.Range(lineTextDecoration.position.start.line + 1, lineTextDecoration.position.start.column + 1, lineTextDecoration.position.start.line + 1, 1024),
      options: {
        after: { content: ` ${lineTextDecoration.content}`, inlineClassName: `${lineTextDecoration.className}` },
        afterContentClassName: `${lineTextDecoration.afterContentClassName}`,
        hoverMessage : lineTextDecoration.hoverMessage
      },
    }
  }
}


export const formatColor = (name) => {
  let color = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  if (color.length === 4) {
    color = color.concat(color.substr(1))
  }
  return color
}
export const defineAndSetTheme = (monaco: React.MutableRefObject<Monaco>, type: string) => {
  const themeType = type === 'dark' ? 'vs-dark' : 'vs'
  const themeName = type === 'dark' ? 'remix-dark' : 'remix-light'
  // see https://microsoft.github.io/monaco-editor/playground.html#customizing-the-appearence-exposed-colors
  const lightColor = formatColor('--light')
  const infoColor = formatColor('--info')
  const darkColor = formatColor('--dark')
  const secondaryColor = formatColor('--secondary')
  const primaryColor = formatColor('--primary')
  const textColor = formatColor('--text') || darkColor
  const textbackground = formatColor('--text-background') || lightColor

  const blueColor = formatColor('--blue')
  const successColor = formatColor('--success')
  const warningColor = formatColor('--warning')
  const yellowColor = formatColor('--yellow')
  const pinkColor = formatColor('--pink')
  const locationColor = '#9e7e08'
  // const purpleColor = formatColor('--purple')
  const dangerColor = formatColor('--danger')
  const greenColor = formatColor('--green')
  const orangeColor = formatColor('--orange')
  const grayColor = formatColor('--gray')

  monaco.current.editor.defineTheme(themeName, {
    base: themeType,
    inherit: true, // can also be false to completely replace the builtin rules
    rules: [
      // all tokens
      { token: '', foreground: textColor.replace('#', ''), background: textbackground.replace('#', '') },

      // global variables
      { token: 'keyword.abi', foreground: blueColor },
      { token: 'keyword.block', foreground: blueColor },
      { token: 'keyword.bytes', foreground: blueColor },
      { token: 'keyword.msg', foreground: blueColor },
      { token: 'keyword.tx', foreground: blueColor },

      // global functions
      { token: 'keyword.assert', foreground: blueColor },
      { token: 'keyword.require', foreground: blueColor },
      { token: 'keyword.revert', foreground: blueColor },
      { token: 'keyword.blockhash', foreground: blueColor },
      { token: 'keyword.keccak256', foreground: blueColor },
      { token: 'keyword.sha256', foreground: blueColor },
      { token: 'keyword.ripemd160', foreground: blueColor },
      { token: 'keyword.ecrecover', foreground: blueColor },
      { token: 'keyword.addmod', foreground: blueColor },
      { token: 'keyword.mulmod', foreground: blueColor },
      { token: 'keyword.selfdestruct', foreground: blueColor },
      { token: 'keyword.type ', foreground: blueColor },
      { token: 'keyword.gasleft', foreground: blueColor },

      // specials
      { token: 'keyword.super', foreground: infoColor },
      { token: 'keyword.this', foreground: infoColor },
      { token: 'keyword.virtual', foreground: infoColor },

      // for state variables
      { token: 'keyword.constants', foreground: grayColor },
      { token: 'keyword.override', foreground: grayColor },
      { token: 'keyword.immutable', foreground: grayColor },

      // data location
      { token: 'keyword.memory', foreground: locationColor },
      { token: 'keyword.storage', foreground: locationColor },
      { token: 'keyword.calldata', foreground: locationColor },

      // for Events
      { token: 'keyword.indexed', foreground: yellowColor },
      { token: 'keyword.anonymous', foreground: yellowColor },

      // for functions
      { token: 'keyword.external', foreground: successColor },
      { token: 'keyword.internal', foreground: successColor },
      { token: 'keyword.private', foreground: successColor },
      { token: 'keyword.public', foreground: successColor },
      { token: 'keyword.view', foreground: successColor },
      { token: 'keyword.pure', foreground: successColor },
      { token: 'keyword.payable', foreground: successColor },
      { token: 'keyword.nonpayable', foreground: successColor },

      // Errors
      { token: 'keyword.Error', foreground: dangerColor },
      { token: 'keyword.Panic', foreground: dangerColor },

      // special functions
      { token: 'keyword.fallback', foreground: pinkColor },
      { token: 'keyword.receive', foreground: pinkColor },
      { token: 'keyword.constructor', foreground: pinkColor },

      // identifiers
      { token: 'keyword.identifier', foreground: warningColor },
      { token: 'keyword.for', foreground: warningColor },
      { token: 'keyword.break', foreground: warningColor },
      { token: 'keyword.continue', foreground: warningColor },
      { token: 'keyword.while', foreground: warningColor },
      { token: 'keyword.do', foreground: warningColor },

      { token: 'keyword.if', foreground: yellowColor },
      { token: 'keyword.else', foreground: yellowColor },

      { token: 'keyword.throw', foreground: orangeColor },
      { token: 'keyword.catch', foreground: orangeColor },
      { token: 'keyword.try', foreground: orangeColor },

      // returns
      { token: 'keyword.returns', foreground: greenColor },
      { token: 'keyword.return', foreground: greenColor }

    ],
    colors: {
      // see https://code.visualstudio.com/api/references/theme-color for more settings
      'editor.background': textbackground,
      'editorSuggestWidget.background': lightColor,
      'editorSuggestWidget.selectedBackground': secondaryColor,
      'editorSuggestWidget.selectedForeground': textColor,
      'editorSuggestWidget.highlightForeground': primaryColor,
      'editorSuggestWidget.focusHighlightForeground': infoColor,
      'editor.lineHighlightBorder': secondaryColor,
      'editor.lineHighlightBackground': textbackground === darkColor ? lightColor : secondaryColor,
      'editorGutter.background': lightColor,
      //'editor.selectionHighlightBackground': secondaryColor,
      'minimap.background': lightColor,
      'menu.foreground': textColor,
      'menu.background': textbackground,
      'menu.selectionBackground': secondaryColor,
      'menu.selectionForeground': textColor,
      'menu.selectionBorder': secondaryColor
    }
  })
  monaco.current.editor.setTheme(themeName)
}