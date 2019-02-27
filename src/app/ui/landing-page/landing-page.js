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
    font-family     : "Lucida Console", Monaco, monospace
}
`

class LandingPage {
  constructor (sections) {
    this.sections = sections
  }

  render () {
    var totalLook = yo`
      <div class="${css.container} bg-secondary">
        <h1> Remix </h1>
      </div>
    `
    for (var i = 0; i < this.sections.length; i++) {
      totalLook.appendChild(yo`
                <div> 
                    ${this.sections[i].render()}
                </div>
              `)
    }

    if (!this._view) {
      this._view = totalLook
    }
    return this._view
  }

  update () {
    yo.update(this._view, this.render())
  }
}

module.exports = LandingPage
