import { getMethodPath, getRootPath } from '../src'

describe('Get Method Path', () => {
  test('call event', () => {
    expect(getMethodPath('call')).toEqual('call')
    expect(getMethodPath('call', '')).toEqual('call')
    expect(getMethodPath('call', 'remixd')).toEqual('call')
    expect(getMethodPath('call', 'remixd.cmd')).toEqual('cmd.call')
    expect(getMethodPath('call', 'remixd.cmd.git')).toEqual('cmd.git.call')
  })

})

describe('Get Root Path', () => {
  test('Get root', () => {
    expect(getRootPath('remixd')).toEqual('remixd')
    expect(getRootPath('remixd.cmd')).toEqual('remixd')
    expect(getRootPath('remixd.cmd.git')).toEqual('remixd')
  })

})
