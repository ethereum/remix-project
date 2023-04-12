import { VariableDeclaration } from "solidity-ast";

export function trim(text: string) {
  if (typeof text === 'string') {
    return text.trim();
  }
}

export function joinLines(text?: string) {
  if (typeof text === 'string') {
    return text.replace(/\n+/g, ' ');
  }
}

/**
 * Format a variable as its type followed by its name, if available.
 */
export function formatVariable(v: VariableDeclaration): string {
  return [v.typeName?.typeDescriptions.typeString].concat(v.name || []).join(' ');
}

export const eq = (a: unknown, b: unknown) => a === b;

export const slug = (str) => {
  if (str === undefined) {
    throw new Error('Missing argument');
  }
  return str.replace(/\W/g, '-');
}

export const names = params => params.map(p => p.name).join(', ');

export const typedParams = params => {
  return params?.map(p => `${p.type}${p.indexed ? ' indexed' : ''}${p.name ? ' ' + p.name : ''}`).join(', ');
};
