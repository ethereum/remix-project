// 'use strict'
// var EventManager = require('../lib/events')
// var modalDialog = require('../app/ui/modaldialog')
// var yo = require('yo-yo')

// class Remixd {
//   constructor (port) {
//     this.event = new EventManager()
//     this.port = port
//     this.callbacks = {}
//     this.callid = 0
//     this.socket = null
//     this.connected = false
//     this.receiveResponse()
//   }

//   online () {
//     return this.socket !== null
//   }

//   close () {
//     if (this.socket) {
//       this.socket.close()
//       this.socket = null
//     }
//   }

//   start (cb) {
//     if (this.socket) {
//       try {
//         this.socket.close()
//       } catch (e) {}
//     }
//     this.event.trigger('connecting', [])
//     this.socket = new WebSocket('ws://localhost:' + this.port, 'echo-protocol') // eslint-disable-line

//     this.socket.addEventListener('open', (event) => {
//       this.connected = true
//       this.event.trigger('connected', [event])
//       cb()
//     })

//     this.socket.addEventListener('message', (event) => {
//       var data = JSON.parse(event.data)
//       if (data.type === 'reply') {
//         if (this.callbacks[data.id]) {
//           this.callbacks[data.id](data.error, data.result)
//           delete this.callbacks[data.id]
//         }
//         this.event.trigger('replied', [data])
//       } else if (data.type === 'notification') {
//         this.event.trigger('notified', [data])
//       } else if (data.type === 'system') {
//         if (data.error) {
//           this.event.trigger('system', [{
//             error: data.error
//           }])
//         }
//       }
//     })

//     this.socket.addEventListener('error', (event) => {
//       this.errored(event)
//       cb(event)
//     })

//     this.socket.addEventListener('close', (event) => {
//       if (event.wasClean) {
//         this.connected = false
//         this.event.trigger('closed', [event])
//       } else {
//         this.errored(event)
//       }
//       this.socket = null
//     })
//   }

//   async receiveResponse (requestId) {
//     return new Promise((resolve, reject) => {
//       this.event.register('replied', (data) => {
//         if (data.id === requestId) {
//           if (data.error) reject(data.error)
//           else resolve(data.result)
//         }
//       })
//     })
//   }

//   errored (event) {
//     function remixdDialog () {
//       return yo`<div>Connection to Remixd closed. Localhost connection not available anymore.</div>`
//     }
//     if (this.connected) {
//       modalDialog('Lost connection to Remixd!', remixdDialog(), {}, {label: ''})
//     }
//     this.connected = false
//     this.socket = null
//     this.event.trigger('errored', [event])
//   }

//   call (service, fn, args, callback) {
//     return new Promise((resolve, reject) => {
//       this.ensureSocket((error) => {
//         if (error) {
//           callback && typeof callback === 'function' && callback(error)
//           reject(error)
//           return
//         }
//         if (this.socket && this.socket.readyState === this.socket.OPEN) {
//           var data = this.format(service, fn, args)
//           this.callbacks[data.id] = callback
//           this.socket.send(JSON.stringify(data))
//           resolve(data.id)
//         } else {
//           callback && typeof callback === 'function' && callback('Socket not ready. state:' + this.socket.readyState)
//           reject('Socket not ready. state:' + this.socket.readyState)
//         }
//       })
//     })
//   }

//   ensureSocket (cb) {
//     if (this.socket) return cb(null, this.socket)
//     this.start((error) => {
//       if (error) {
//         cb(error)
//       } else {
//         cb(null, this.socket)
//       }
//     })
//   }

//   format (service, fn, args) {
//     var data = {
//       id: this.callid,
//       service: service,
//       fn: fn,
//       args: args
//     }
//     this.callid++
//     return data
//   }
// }

// module.exports = Remixd
