// Type definitions for the things we need from remix-lib

declare module 'remix-lib' {
  export module util {
    export function findLowerBound(target: number, array: Array<number>): number;
  }
}
