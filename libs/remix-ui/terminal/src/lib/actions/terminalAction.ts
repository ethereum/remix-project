
export const registerCommandAction = (name, command, activate, dispatch) => {
  const commands: any = {}
  const _commands: any = {}
  _commands[name] = command
  const data: any = {
    // lineLength: props.options.lineLength || 80,
    session: [],
    activeFilters: { commands: {}, input: '' },
    filterFns: {}
  }
  const _INDEX = {
    all: [],
    allMain: [],
    commands: {},
    commandsMain: {}
  }

  const registerFilter = (commandName, filterFn) => {
    data.filterFns[commandName] = filterFn
  }

  // const _appendItem = (item) => {
  //   var { el, gidx } = item
  //   _JOURNAL[gidx] = item
  //   if (!_jobs.length) {
  //     requestAnimationFrame(function updateTerminal () {
  //       _jobs.forEach(el => _view.journal.appendChild(el))
  //       .scroll2bottom()
  //       ._jobs = []
  //     })
  //   }
  //   if (data.activeFilters.commands[item.cmd]) _jobs.push(el)
  // }

  commands[name] = function () {
    const args = [...arguments]
    const steps = []
    const root = { steps, cmd: name, gidx: 0, idx: 0 }
    const ITEM = { root, cmd: name }
    root.gidx = _INDEX.allMain.push(ITEM) - 1
    // root.idx = _INDEX.commandsMain[name].push(ITEM) - 1
    let item
    function append (cmd, params, el) {
      if (cmd) { // subcommand
        item = { el, cmd, root }
      } else { // command
        item = ITEM
        item.el = el
        cmd = name
      }
      item.gidx = _INDEX.all.push(item) - 1
      item.idx = _INDEX.commands[cmd].push(item) - 1
      item.step = steps.push(item) - 1
      item.args = params
      // _appendItem(item)
      console.log({ item }, 'append items')
      // self._appendItem(item)
    }
    var scopedCommands = _scopeCommands(append)
    command(args, scopedCommands, el => append(null, args, blockify(el)))
    console.log({ args })
  }
  const help = typeof command.help === 'string' ? command.help : [
    '// no help available for:', `terminal.command.${name}`
  ].join('\n')
  commands[name].toString = () => { return help }
  commands[name].help = help
  data.activeFilters.commands[name] = activate && activate.activate
  if (activate.filterFn) {
    registerFilter(name, activate.filterFn)
  }
  dispatch({ type: name, payload: { commands: commands, _commands: _commands, data: data } })

  const blockify = (el) => {
    return `<div class="px-4 block_2A0YE0" data-id="block_null">${el}</div>`
  }

  const _scopeCommands = (append) => {
    const scopedCommands = {}
    Object.keys(commands).forEach(function makeScopedCommand (cmd) {
      var command = _commands[cmd]
      scopedCommands[cmd] = function _command () {
        var args = [...arguments]
        console.log({ cmd }, { args }, { blockify })
        command(args, scopedCommands, el => append(cmd, args, blockify(el)))
      }
    })
    console.log({ scopedCommands })
    return scopedCommands
  }

}

export const filterFnAction = (name, filterFn, dispatch) => {
  const data: any = {
    // session: [],
    // activeFilters: { commands: {}, input: '' },
    filterFns: {}
  }
  data.filterFns[name] = filterFn
  dispatch({ type: name, payload: { data: data } })
}

export const registerLogScriptRunnerAction = (event, commandName, commandFn, dispatch) => {
  event.on('scriptRunner', commandName, (msg) => {
    commandFn.log.apply(commandFn, msg.data)
    dispatch({ type: commandName, payload: { commandFn, message: msg.data } })
  })
}

export const registerInfoScriptRunnerAction = (event, commandName, commandFn, dispatch) => {
  event.on('scriptRunner', commandName, (msg) => {
    commandFn.info.apply(commandFn, msg.data)
    dispatch({ type: commandName, payload: { commandFn, message: msg.data } })
  })
}

export const registerWarnScriptRunnerAction = (event, commandName, commandFn, dispatch) => {
  event.on('scriptRunner', commandName, (msg) => {
    commandFn.warn.apply(commandFn, msg.data)
    dispatch({ type: commandName, payload: { commandFn, message: msg.data } })
  })
}

export const registerErrorScriptRunnerAction = (event, commandName, commandFn, dispatch) => {
  event.on('scriptRunner', commandName, (msg) => {
    commandFn.error.apply(commandFn, msg.data)
    dispatch({ type: commandName, payload: { commandFn, message: msg.data } })
  })
}
