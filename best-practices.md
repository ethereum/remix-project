# Current "Best Practice" Conventions


- Please use [JS Standard Style](https://standardjs.com/) as a coding style guide.
- `ES6 class` rather than ES5 to create class.
- CSS declaration using `csjs-inject`.
- CSS files: 

  **if** the CSS section of an UI component is too important, CSS declarations should be put in a different file and in a different folder.
  
  The folder should be named `styles` and the file should be named with the extension `-styles.css`.
  
  e.g: `file-explorer.js` being an UI component `file-explorer-styles.css` is created in the `styles` folder right under `file-explorer.js`

  **if** the CSS section of an UI component is rather limited it is preferable to put it in the corresponding JS file.
  
- HTML declaration using `yo-yo`.

- A module trigger events using `event` property:
  `self.event = new EventManager()`. 
  Events can then be triggered:
  `self.event.trigger('eventName', [param1, param2])`
- `self._view` is the HTML view renderered by `yo-yo` in the `render` function.
- `render()` this function should be called at the first rendering (make sure that the returned node element is put on the DOM), and should *not* by called again from outside the component.
- `update()` call this function to update the DOM when the state of the component has changed (this function must be called after the initial call to `render()`).
- for all functions / properties, prefixing by underscore (`_`) means the scope is private, and they should **not** be accessed not changed from outside the component.
- constructor arguments: There is no fixed rule whether it is preferrable to use multiples arguments or a single option *{}* argument (or both).
  We recommend: 
    - use a specific slot for **obligatory** arguments and/or for complex arguments (meaning not boolean, not string, etc...).
    - put arguments in an option *{}* for non critical and for optionnal arguments.
    - if a component has more than 4/5 parameters, it is recommended to find a way to group some in one or more *opt* arguments.
  
- look them up, discuss them, update them.
    
## Module Definition (example)
```js
// user-card.js
var yo = require('yo-yo')
var csjs = require('csjs-inject')
var EventManager = require('remix-lib').EventManager

var css = csjs`
  .userCard        {
    position       : relative;
    box-sizing     : border-box;
    display        : flex;
    flex-direction : column;
    align-items    : center;
    border         : 1px solid black;
    width          : 400px;
    padding        : 50px;  
  }
  .clearFunds { background-color: lightblue; }
`

class UserCard {
  constructor (api, events, opts = {}) {
    var self = this

    self.event = new EventManager()
    self.opts = opts
    self._api = api
    self._consumedEvents = events
    self._view = undefined
    
    events.funds.register('fundsChanged', function (amount) {
      if (amount < self.state._funds) self.state.totalSpend += self.state._funds - amount
      self.state._funds = amount
      self.render()
    })
    self.event.trigger('eventName', [param1, param2])
  }
  render () {
    var self = this
    var view = yo`
      <div class=${css.userCard}>
        <h1> @${self.state._nickname} </h1>
        <h2> Welcome, ${self.state.title || ''} ${self.state.name || 'anonymous'} ${self.state.surname} </h2>
        <ul> <li> User Funds: $${self.state._funds} </li> </ul>
        <ul> <li> Spent Funds: $${self.state.totalSpend} </li> </ul>
        <button class=${css.clearFunds} onclick=${e=>self._spendAll.call(self, e)}> spend all funds </button>
      </div>
    `
    if (!self._view) {
      self._view = view
    }
    return self._view
  }
  update () {
    yo.update(this._view, this.render())
  }
  setNickname (name) {
    this._nickname = name
  }
  getNickname () {
    var self = this
    return `@${self.state._nickname}`
  }
  getFullName () {
    var self = this
    return `${self.state.title} ${self.state.name} ${self.state.surname}`
  }
  _spendAll (event) {
    var self = this
    self._appAPI.clearUserFunds()
  }
  _constraint (msg) { throw new Error(msg) }
}

module.exports = UserCard
```
## Module Usage (example)
```js
/*****************************************************************************/
// 1. SETUP CONTEXT
var EventManager = require('remix-lib').EventManager
var funds = { event: new EventManager() }
var userfunds = 15
function getUserFunds () { return userfunds }
function clearUserFunds () {
  var spent = userfunds
  userfunds = 0
  console.log(`all funds of ${usercard.getFullName()} were spent.`)
  funds.event.trigger('fundsChanged', [userfunds])
  return spent
}
setInterval(function () {
  userfunds++
  funds.event.trigger('fundsChanged', [userfunds])
}, 100)

/*****************************************************************************/
// 2. EXAMPLE USAGE
var UserCard = require('./user-card')

var usercard = new UserCard(
  { getUserFunds, clearUserFunds }, 
  { funds: funds.event },
  {
    title: 'Dr.',
    name: 'John',
    surname: 'Doe',
    nickname: 'johndoe99'
  })

var el = usercard.render()
document.body.appendChild(el)
setTimeout(function () {
  userCard.setNickname('new name') 
  usercard.update()
}, 5000)

```
