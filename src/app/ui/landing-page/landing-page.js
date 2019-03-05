var yo = require('yo-yo')
var csjs = require('csjs-inject')
var css = csjs`
  .container        {
    position        : static;

    box-sizing      : border-box;

    display         : flex;
    flex-direction  : column;
    flex-wrap       : wrap;
    align-items     : center;
    align-content   : space-around;
    
    border          : 2px solid black;
    width           : 400px;
    padding         : 50px;
    font-family     : "Lucida Console", Monaco, monospace;
  }
  .logo             {
    position        : absolute;
    opacity         : 0.3;
    z-index         : 0;
  }
  .section          {
    z-index         : 10;
  }
`

class LandingPage {
  constructor (sections) {
    this.sections = sections
  }

  render () {
    var totalLook = yo`
      <div class="${css.container}">
        <img src="icon.png" class="${css.logo}" />
      </div>
    `
    for (var i = 0; i < this.sections.length; i++) {
      totalLook.appendChild(yo`
                <div class="${css.section}" > 
                    ${this.sections[i].render()}
                </div>
              `)
    }
    return totalLook
  }
}

module.exports = LandingPage
