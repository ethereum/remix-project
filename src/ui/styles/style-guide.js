var csjs = require('csjs-inject')

module.exports = styleGuide

function styleGuide () {
  /* --------------------------------------------------------------------------
  COLORS
  -------------------------------------------------------------------------- */
  var colors = {
    // BASIC COLORS (B&W and transparent)
    transparent: 'transparent',
    white: 'hsl(0, 0%, 100%)',
    black: 'hsl(0, 0%, 0%)',
    opacityBlack: 'hsla(0, 0%, 0%, .4)',
    // BLUE
    blue: 'hsla(229, 75%, 87%, 1)',
    lightBlue: 'hsla(229, 75%, 87%, .5)',
    backgroundBlue: 'hsla(229, 100%, 97%, 1)',
    // GREY
    grey: 'hsla(0, 0%, 40%, 1)',
    lightGrey: 'hsla(0, 0%, 40%, .5)',
    veryLightGrey: 'hsla(0, 0%, 40%, .2)',
    // RED
    red: 'hsla(0, 82%, 82%, 1)',
    lightRed: 'hsla(0, 82%, 82%, .5)',
    // GREEN
    green: 'hsla(141, 75%, 84%, 1)',
    lightGreen: 'hsla(141, 75%, 84%, .5)',
    // PINK
    pink: 'hsla(300, 69%, 76%, 1)',
    lightPink: 'hsla(300, 69%, 76%, .5)',
    // YELLOW
    orange: 'hsla(44, 100%, 50%, 1)',
    lightOrange: 'hsla(44, 100%, 50%, .5)',
    // VIOLET
    violet: 'hsla(240, 64%, 68%, 1)'
  }
/* --------------------------------------------------------------------------
                                  BUTTONSsss
-------------------------------------------------------------------------- */
var buttons = csjs`
  .button {
    border-color            : transparent;
    border-radius           : 3px;
    border                  : .3px solid ${colors.veryLightGrey};
    cursor                  : pointer;
    min-height              : 25px;
    max-height              : 25px;
    padding                 : 3px;
    min-width               : 100px;
    font-size               : 12px;
    overflow                : hidden;
    word-break              : normal;
    background-color        : ${colors.veryLightGrey};
    color                   : ${colors.grey};
    margin                  : 3px;
  }
`

var textBoxes = csjs`
  .input {
    border                : 1px solid ${colors.lightGrey};  // light-grey
    margin                : .3em;
    height                : 25px;
    font-size             : 10px;
    border-radius         : 3px;
    padding               : 0 8px;
    overflow              : hidden;
    word-break            : normal;
  }
`

  return {
    button: buttons['button'],
    colors: colors,
    inputField: textBoxes['input']
  }
}
