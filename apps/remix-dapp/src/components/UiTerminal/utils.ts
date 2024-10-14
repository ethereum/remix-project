export const getKeyOf = (item: any) => {
  return Object.keys(item)[0];
};

export const getValueOf = (item: any) => {
  return Object.values(item)[0];
};

export const Objectfilter = (obj: any, filterValue: any) =>
  obj.filter((item: any) => Object.keys(item)[0].includes(filterValue));

export const matched = (arr: [], value: string) =>
  arr
    .map((x) => Object.keys(x).some((x) => x.startsWith(value)))
    .some((x) => x);

const findDeep = (
  object: any,
  fn: any,
  found = { break: false, value: undefined },
) => {
  if (typeof object !== 'object' || object === null) return;
  for (const i in object) {
    if (found.break) break;
    let el = object[i];
    if (el?.innerText != null) el = el.innerText;
    if (fn(el, i, object)) {
      found.value = el;
      found.break = true;
      break;
    } else {
      findDeep(el, fn, found);
    }
  }
  return found.value;
};

export const find = (args: any, query: any) => {
  query = query.trim();
  // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
  const isMatch = !!findDeep(args, function check(value: null | undefined) {
    if (value === undefined || value === null) return false;
    if (typeof value === 'function') return false;
    if (typeof value === 'object') return false;
    const contains = String(value).includes(query.trim());
    return contains;
  });
  return isMatch;
};

export const wrapScript = (script: string) => {
  const isKnownScript = ['remix.', 'console.', 'git', 'gpt'].some((prefix) =>
    script.trim().startsWith(prefix),
  );
  if (isKnownScript) return script;
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
        `;
};
