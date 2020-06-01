'use strict'
const tape = require('tape')
const EventManager = require('../src/eventManager')
tape('eventManager', function (t) {
  t.test('eventManager', function (st) {
    const events = new EventManager()
    const listenner = {}

    let trace = ''
    listenner.listen = function (data1) {
      trace += data1
    }
    const registeredFunction = function (data) {
      trace += data
    }
    events.register('event1', listenner, listenner.listen)
    events.register('event2', registeredFunction)
    events.trigger('event1', ['event1'])
    events.trigger('event2', ['event2'])
    st.equal(trace, 'event1event2')

    events.unregister('event1', listenner.listen)
    st.equal(events.registered['event1'].length, 1)
    st.equal(events.registered['event2'].length, 1)

    events.unregister('event1', listenner, listenner.listen)
    st.equal(events.registered['event1'].length, 0)
    st.equal(events.registered['event2'].length, 1)

    events.unregister('event2', registeredFunction)
    st.equal(events.registered['event1'].length, 0)
    st.equal(events.registered['event2'].length, 0)
    st.end()
  })
})
