var yo = require('yo-yo')
var csjs = require('csjs-inject')
var EventManager = require('../../lib/events')

module.exports = class Card {
  constructor (api, events, opts) {
    const self = this
    self._api = api
    self._events = events
    self._opts = opts
    self._view = {}
    self.event = new EventManager()
  }
  render () {
    const self = this
    if (self._view.el) return self._view.el

    self._view.cardBody = yo`<div class=${css.cardBody}></div>`
    self._view.arrow = yo`<i class="${css.arrow} fas fa-angle-down" onclick="${() => trigger(this)}"></i>`

    self._view.expandCollapseButton = yo`
    <div class=${css.expandCollapseButton}>${self._view.arrow}</div>`

    self._view.statusBar = yo`<div class=${css.statusBar}>${self._opts.collapsedView}</div>`
    self._view.cardHeader = yo`
    <div class=${css.cardHeader} onclick=${() => trigger(self._view.arrow)}>
      <div class="pr-1 ${css.cardTitles}">
        <div class=${css.cardTitle}>${self._opts.title}</div>
        ${self._view.statusBar}
      </div>
      <div class=${css.expandCollapseButton}>${self._view.expandCollapseButton}</div>
    </div>`

    function trigger (el) {
      var body = self._view.cardBody
      var status = self._view.statusBar
      if (el.classList) {
        el.classList.toggle('fa-angle-up')
        var arrow = el.classList.toggle('fa-angle-down') ? 'up' : 'down'
        self.event.trigger('expandCollapseCard', [arrow, body, status])
      }
    }

    // HTML
    self._view.el = yo`
      <div class="${css.cardContainer} list-group-item border-0">
        ${self._view.cardHeader}
        ${self._view.cardBody}
      </div>`

    return self._view.el
  }

}

const css = csjs`
  .cardContainer {
    padding             : 0 24px 16px;
    margin              : 0;
    background          : none;
  }
  .cardHeader {
    display             : flex;
    justify-content     : space-between;
    align-items         : center;
  }
  .statusBar {}
  .cardBody {}
  .cardTitles {
    display             : flex;
    flex-direction      : row;
    align-items         : center;
  }
  .cardTitle {
    font-size           : 14px;
    font-weight         : 400;
    margin-right        : 8px;
    line-height         : 19px;
  }
  .expandCollapseButton {}
  .arrow {
    font-weight         : bold;
    cursor              : pointer;
    font-size           : 14px;
  }
  .arrow:hover {
  }

`
