let yo = require('yo-yo')
let csjs = require('csjs-inject')

var css = csjs`
  .item {
    display         : flex;
    flex-direction  : column;
    align-items     : center;
    width           : 400px;
    height          : 160px;
    padding         : 20px;
    background-color: var(--primary);
    font-family     : "Lucida Console", Monaco, monospace;
    font-size       : 12px;
    cursor          : default;
  }
  span {
    cursor: pointer;
    font-size: 100%;
  }
  span:hover {
    font-size: 120%;
  }
  a:link {
    text-decoration : none;
    color: white
    font-size: 100%;
  }
  a:hover {
    color: var(--bg-warning);
    font-size: 120%;
  }
`

class Section {
  constructor (title, actions) {
    this.title = title
    this.actions = actions
    this.cardStyle = (this.title === 'Workspaces') ? 'bg-success' : 'border-success'
  }

  render () {
    let sectionLook = yo`
      <div class="card ${this.cardStyle} bg-primary mb-3">
        <div class="card-header">${this.title}</div>
        <div class="card-body" style="min-width: 350px;">
        </div>
      </div>
    `
    for (var i = 0; i < this.actions.length; i++) {
      if (this.actions[i].type === `callback`) {
        sectionLook.appendChild(yo`
          <div>
            <span class="card-text" onclick=${this.actions[i].payload} >
              ${this.actions[i].label}
            </span>
          </div>
        `)
      } else if (this.actions[i].type === `link`) {
        sectionLook.appendChild(yo`
          <div>
            <a  href=${this.actions[i].payload} target="_blank" >
              ${this.actions[i].label}
            </a>
          </div>
        `)
      }
    }

    if (!this._view) {
      this._view = sectionLook
    }

    return this._view
  }

}

module.exports = Section
