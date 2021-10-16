export const wrapScript = (script) => {
  const isKnownScript = ['remix.', 'git'].some(prefix => script.trim().startsWith(prefix))
  if (isKnownScript) return script
  return `
        try {
          const ret = ${script};
          if (ret instanceof Promise) {
            ret.then((result) => { console.log(result) }).catch((error) => { console.log(error) })
          } else {
            console.log(ret)
          }   
        } catch (e) {
          console.log(e.message)
        }
        `
}
