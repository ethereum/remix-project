
export function hyphenateString(str) {
  // Convert camelCase to hyphen-case
  str = str.replace(/([a-z])([A-Z])/g, '$1-$2');
  // Replace all non-alphanumeric characters with hyphens
  return str.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
}
