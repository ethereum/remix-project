module.exports = stacktrace
/*
  Not used yet
*/
function stacktrace () {
  var _ = Error.prepareStackTrace
  Error.prepareStackTrace = (_, stack) => stack
  var callsites = new Error().stack
  Error.prepareStackTrace = _
  return callsites.slice(2).map(x => { return x.getFunctionName() }).reverse().join('.')
}
