# Current "Best Practice" Conventions
* look them up
* discuss them
* update them

## Module Definition (example)
```js
// user-card.js
var yo = require('yo-yo')
var csjs = require('csjs-inject')
var EventManager = require('ethereum-remix').lib.EventManager

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
  constructor (opts = {}) {
    var self = this

    self.event = new EventManager()
    self._api = opts.api
    self._view = undefined
    self.data = {
      title: opts.title,
      name: opts.name,
      surname: opts.surname,
      totalSpend: 0,
      _nickname: opts.nickname,
      _funds: self._appAPI.getUserFunds()
    }
    var events = opts.events

    events.funds.register('fundsChanged', function (amount) {
      if (amount < self.data._funds) self.data.totalSpend += self.data._funds - amount
      self.data._funds = amount
      self.render()
    })
  }
  render () {
    var self = this
    var el = yo`
      <div class=${css.userCard}>
        <h1> @${self.data._nickname} </h1>
        <h2> Welcome, ${self.data.title || ''} ${self.data.name || 'anonymous'} ${self.data.surname} </h2>
        <ul> <li> User Funds: $${self.data._funds} </li> </ul>
        <ul> <li> Spent Funds: $${self.data.totalSpend} </li> </ul>
        <button class=${css.clearFunds} onclick=${e=>self._spendAll.call(self, e)}> spend all funds </button>
      </div>
    `
    if (self._view) yo.update(self._view, el)
    else self._view = el
    return self._view
  }
  update (data = {}) {
    var self = this
    if (!self._view) self._constraint('first initialize view by calling `.render()`')
    if (data.hasOwnProperty('title')) self.data.title = data.title
    if (data.hasOwnProperty('name')) self.data.name = data.name
    if (data.hasOwnProperty('surname')) self.data.surname = data.surname
    self.render()
  }
  getNickname () {
    var self = this
    return `@${self.data._nickname}`
  }
  getFullName () {
    var self = this
    return `${self.data.title} ${self.data.name} ${self.data.surname}`
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
var EventManager = require('ethereum-remix').lib.EventManager
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

var usercard = new UserCard({
  api: { getUserFunds, clearUserFunds },
  events: { funds: funds.event },
  title: 'Dr.',
  name: 'John',
  surname: 'Doe',
  nickname: 'johndoe99'
})

var el = usercard.render()
document.body.appendChild(el)
setTimeout(function () { usercard.update({ title: 'Prof.' }) }, 5000)
```
