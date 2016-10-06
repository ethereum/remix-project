'use strict'
module.exports = {
  truncate: {
    'white-space': 'nowrap',
    'overflow': 'hidden',
    'text-overflow': 'ellipsis',
    'margin-right': '5px'
  },
  font: {
    'font-family': 'arial,sans-serif'
  },
  container: {
    'margin': '10px',
    'padding': '5px'
  },
  statusMessage: {
    'margin-left': '15px'
  },
  address: {
    'font-style': 'italic'
  },
  instructionsList: {
    'width': '72%',
    'height': '330px',
    'overflow-y': 'scroll',
    'list-style-type': 'none',
    'margin': 'auto'
  },
  transactionInfo: {
    'margin-top': '5px'
  },
  panel: {
    container: {
      'border': '1px solid',
      'width': '600px'
    },
    tableContainer: {
      'height': '300px',
      'overflow-y': 'auto'
    },
    table: {
      'padding': '5px'
    },
    title: {
      'padding': '5px',
      'font-style': 'italic'
    }
  },
  hidden: {
    'display': 'none'
  },
  display: {
    'display': 'block'
  },
  sticker: {
    'vertical-align': 'top',
    'margin': '5px'
  },
  inline: {
    'display': 'inline-block'
  },
  vmargin: {
    'margin-top': '10px',
    'margin-bottom': '10px'
  },
  button: {
    '-moz-box-shadow': 'inset 0px 1px 0px 0px #ffffff',
    '-webkit-box-shadow': 'inset 0px 1px 0px 0px #ffffff',
    'box-shadow': 'inset 0px 1px 0px 0px #ffffff',
    'background': '-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #f9f9f9), color-stop(1, #e9e9e9))', // eslint-disable-line
    'background': '-moz-linear-gradient(top, #f9f9f9 5%, #e9e9e9 100%)', // eslint-disable-line
    'background': '-webkit-linear-gradient(top, #f9f9f9 5%, #e9e9e9 100%)', // eslint-disable-line
    'background': '-o-linear-gradient(top, #f9f9f9 5%, #e9e9e9 100%)', // eslint-disable-line
    'background': '-ms-linear-gradient(top, #f9f9f9 5%, #e9e9e9 100%)', // eslint-disable-line
    'background': 'linear-gradient(to bottom, #f9f9f9 5%, #e9e9e9 100%)', // eslint-disable-line
    'filter': "progid:DXImageTransform.Microsoft.gradient(startColorstr='#f9f9f9', endColorstr='#e9e9e9',GradientType=0)", // eslint-disable-line
    'background-color': '#f9f9f9',
    '-moz-border-radius': '6px',
    '-webkit-border-radius': '6px',
    'border-radius': '6px',
    'border': '1px solid #dcdcdc',
    'display': 'inline-block',
    'cursor': 'pointer',
    'color': '#666666',
    'font-family': 'Arial',
    'text-decoration': 'none',
    'text-shadow': '0px 1px 0px #ffffff'
  }
}
