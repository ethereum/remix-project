export default function buildGroupTest (group: string, test: any) {
  const ob = {}
  // eslint-disable-next-line dot-notation
  const defaults = test['default']
  for (const key of Object.keys(defaults)) {
    if (typeof defaults[key] === 'function' && (key.indexOf(`#${group}`) > -1 || key.indexOf('#group') === -1)) {
      ob[key.replace(`#${group}`, '')] = defaults[key]
    }
  }
  console.log(ob)
  return ob
}
