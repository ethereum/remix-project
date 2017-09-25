// var csjs = require('csjs-inject')

module.exports = styleGuide

function styleGuide () {
  /* --------------------------------------------------------------------------
  COLORS
  -------------------------------------------------------------------------- */
  var colors = {
    // BACKGROUND COLORS
    general_BackgroundColor: 'hsl(0, 0%, 100%)',  // white
    highlight_BackgroundColor: 'hsla(229, 100%, 97%, 1)', // backgroundBlue

    // TEXT COLORS
    mainText_Color: 'hsl(0, 0%, 0%)', // black
    normalText_Color: 'hsla(0, 0%, 40%, 1)', // grey

    // ICONS
    icon_Color: 'hsl(0, 0%, 0%)', // black
    icon_HoverColor: 'hsla(44, 100%, 50%, 1)', // orange

    // UI ELEMENTS
    element_TextColor: 'hsl(0, 0%, 0%)', // black ,
    element_BackgroundColor: 'hsl(0, 0%, 100%)', // white
    element_BorderColor: 'hsla(0, 0%, 40%, .2)', // very light grey

/*
1. most css properties can take many or infinite amounf of different values
=> so we define a set of concrete values that we use:
- variable just for plain colors (later also fonts, widths, paddings, border radiuses...)

2. we define certain semantic names that make sense in the context of our app
=> so we can use the values used in (1.) e.g. like 'color_red'  and assign it to e.g.
- highlightColor: color_red
- borderColor: color_white
- ...

3. we define a nested object that represents the component hierarchy that
makes up our app and use semantic names defined under (2.)

*/

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

var elementColors = {
  /* -----------------------
          BUTTONS
  ----------------------- */
  // DROPDOWN
  dropdown_TextColor: colors.element_TextColor,
  dropdown_BackgroundColor: colors.element_BackgroundColor,
  dropdown_BorderColor: colors.element_BorderColor,

  // BUTTON
  button_TextColor: colors.element_TextColor,
  button_BorderColor: colors.element_BorderColor,
  rightPanel_compileTab_compileButton_BackgroundColor: 'hsla(0, 0%, 40%, .2)',
  rightPanel_compileTab_otherButtons_BackgroundColor: 'hsla(0, 0%, 40%, .2)'

  /* -----------------------
          TEXT BOXES
  ----------------------- */
}
  /* --------------------------------------------------------------------------
                                TEXT-BOXES
  -------------------------------------------------------------------------- */
  var textBoxes = {

    'display-box': `
      font-size             : 12px;
      padding               : 10px 15px;
      line-height           : 20px;
      background            : ${colors.white};
      border-radius         : 3px;
      border                : 1px solid ${colors.veryLightGrey};
      overflow              : hidden;
      word-break            : break-word;
      width                 : 100%;
    `,

    'info-text-box': `
      background-color      : ${colors.white};
      line-height           : 20px;
      border                : .2em dotted ${colors.lightGrey};
      padding               : 8px 15px;
      border-radius         : 5px;
      margin-bottom         : 1em;
      overflow              : hidden;
      word-break            : break-word;
    `,

    'input': `
      border                : 1px solid ${colors.veryLightGrey};
      height                : 25px;
      width                 : 250px;
      border-radius         : 3px;
      padding               : 0 8px;
      overflow              : hidden;
      word-break            : normal;
    `
  }
  /* --------------------------------------------------------------------------
                                    BUTTONS
  -------------------------------------------------------------------------- */
  var buttons = {

    'button': `
      background-color        : ${elementColors.button_BackgroundColor};
      border                  : .3px solid ${elementColors.button_BorderColor};
      color                   : ${elementColors.button_TextColor};
      display                 : flex;
      align-items             : center;
      justify-content         : center;
      border-radius           : 3px;
      cursor                  : pointer;
      min-height              : 25px;
      max-height              : 25px;
      width                   : 70px;
      min-width               : 70px;
      font-size               : 12px;
      overflow                : hidden;
      word-break              : normal;
    `,

    'button:hover': `
      opacity                 : 0.8;
    `,

    'dropdown': `
      color                   : ${elementColors.dropdown_TextColor};
      background-color        : ${elementColors.dropdown_BackgroundColor};
      border                  : 1px solid ${elementColors.dropdown_BorderColor};
      font-size               : 12px;
      font-weight             : bold;
      padding                 : 0 8px;
      text-decoration         : none;
      cursor                  : pointer;
      border-radius           : 3px;
      height                  : 25px;
      width                   : 250px;
      text-align              : center;
      overflow                : hidden;
      word-break              : normal;
    `

  }

  return {
    colors: colors,
    elementColors: elementColors,
    dropdown: buttons['dropdown'],
    button: buttons['button'],
    inputField: textBoxes['input'],
    infoTextBox: textBoxes['info-text-box'],
    displayBox: textBoxes['display-box']
  }
}
