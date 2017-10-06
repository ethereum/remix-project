var yo = require('yo-yo')
var EventManager = require('ethereum-remix').lib.EventManager
// -------------- styling ----------------------
var csjs = require('csjs-inject')
var remix = require('ethereum-remix')
var styleGuide = remix.ui.styleGuide
var styles = styleGuide()

var css = csjs`
  .dropdown           {
    ${styles.terminal.dropdown_Filter_MenuBar}
    overflow          : visible;
    position          : relative;
    display           : flex;
    flex-direction    : column;
    margin-right      : 3px;
  }
  .selectbox          {
    display           : flex;
    align-items       : center;
    margin            : 3px;
    cursor            : pointer;
  }
  .selected           {
    display           : inline-block;
    min-width         : 30ch;
    max-width         : 30ch;
    white-space       : nowrap;
    text-overflow     : ellipsis;
    overflow          : hidden;
    padding           : 3px;
  }
  .icon               {
    padding           : 0px 5px;
  }
  .options            {
    position          : absolute;
    display           : flex;
    flex-direction    : column;
    align-items       : end;
    top               : 24px;
    left              : 0;
    width             : 250px;
    background-color  : ${styles.appProperties.dropdown_BackgroundColor};
    border            : 1px solid ${styles.appProperties.dropdown_BorderColor};
    border-radius     : 3px;
    border-top        : 0;
  }
  .option {
    margin: 0;
  }
`
/* USAGE:

  var dropdown = new Dropdown({
    options: [
      'knownTransaction',
      'unknownTransaction',
      'log',
      'info',
      'error'
    ],
    defaults: ['knownTransaction']
  })
  dropdown.event.register('deselect', function (label) { })
  dropdown.event.register('select', function (label) { })

*/
class Dropdown {
  constructor (opts = {}) {
    var self = this
    self.event = new EventManager()
    self.data = {
      _options: opts.options || [],
      _dependencies: opts.dependencies || [],
      selected: opts.defaults || [],
      _elements: []
    }
    self._view = {}
    self._api = opts.api
    self._events = opts.events
  }
  render () {
    var self = this
    if (self._view.el) return self._view.el
    self._view.selected = yo`
      <div class=${css.selectbox}>
        <span class=${css.selected}> [${self.data.selected.length}] ${self.data.selected.join(', ')}</span>
        <i class="${css.icon} fa fa-caret-down"></i>
      </div>
    `
    self._view.el = yo`
      <div class=${css.dropdown} onclick=${show}>
        ${self._view.selected}
        <div class=${css.options} style="display: none;">
          ${self.data._options.map(label => {
            var input = yo`<input data-idx=${self.data._elements.length} onchange=${emit} type="checkbox" />`
            if (self.data.selected.indexOf(label) !== -1) {
              input.checked = true
              self.event.trigger('select', [label])
            }
            self.data._elements.push(input)
            return yo`
              <div class=${css.option}>
                ${input}
                <label>${label}</label>
              </div>
            `
          })}
        </div>
      </div>
    `
    return self._view.el
    function emit (event) {
      var input = event.currentTarget
      var label = input.nextSibling.innerText
      if (input.checked) {
        self.data.selected.push(label)
        if (event.type === 'change') {
          self.event.trigger('select', [label])
          updateDependencies(label)
        }
      } else {
        var idx = self.data.selected.indexOf(label)
        self.data.selected.splice(idx, 1)
        if (event.type === 'change') {
          self.event.trigger('deselect', [label])
          updateDependencies(label)
        }
      }
      self._view.selected.children[0].innerText = `[${self.data.selected.length}] ${self.data.selected.join(', ')}`
    }
    function updateDependencies (changed) {
      if (self.data._dependencies[changed]) {
        for (var dep in self.data._dependencies[changed]) {
          var label = self.data._dependencies[changed][dep]
          var el = self.data._elements[self.data._options.indexOf(label)]
          el.checked = !el.checked
          emit({currentTarget: el, type: 'changeDependencies'})
        }
      }
    }
    function show (event) {
      event.stopPropagation()
      var options = event.currentTarget.children[1]
      var parent = event.target.parentElement
      var isOption = parent === options || parent.parentElement === options
      if (isOption) return
      if (options.style.display === 'none') {
        options.style.display = ''
        document.body.addEventListener('click', handler)
      } else {
        options.style.display = 'none'
        document.body.removeEventListener('click', handler)
      }
      function handler (event) {
        options.style.display = 'none'
        document.body.removeEventListener('click', handler)
      }
    }
  }
}

module.exports = Dropdown
