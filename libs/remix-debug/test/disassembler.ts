'use strict'

import tape from 'tape'
const disassemble = require('../src/code/disassembler').disassemble

tape('Disassembler', function (t) {
  t.test('empty', function (st) {
    st.plan(1)
    st.equal(disassemble(''), '')
  })
  t.test('add', function (st) {
    st.plan(1)
    st.equal(disassemble('0x01'), 'add')
  })
  t.test('push', function (st) {
    st.plan(1)
    st.equal(disassemble('0x640203'), '0x0203000000')
  })
  t.test('complexcode', function (st) {
    st.plan(1)
    const code = '60606040526009600060005055607e8060186000396000f360606040526000357c0100000000000000000000000000000000000000000000000000000000900480630dbe671f146039576035565b6002565b3460025760486004805050604a565b005b6000600090505b600a811015607a5760006000818150548092919060010191905055505b80806001019150506051565b5b5056'
    const asm = `mstore(0x40, 0x60)
0x09
0x00
pop(0x00)
sstore
0x7e
dup1
0x18
0x00
codecopy
0x00
return
mstore(0x40, 0x60)
calldataload(0x00)
0x0100000000000000000000000000000000000000000000000000000000
swap1
div
dup1
0x0dbe671f
eq
0x39
jumpi
jump(0x35)
label1:
jump(0x02)
label2:
jumpi(0x02, callvalue())
0x48
0x04
dup1
pop
pop
jump(0x4a)
label3:
stop()
label4:
0x00
0x00
swap1
pop
label5:
0x0a
dup2
lt
iszero
0x7a
jumpi
0x00
0x00
dup2
dup2
pop
sload
dup1
swap3
swap2
swap1
0x01
add
swap2
swap1
pop
sstore
pop
label6:
dup1
dup1
0x01
add
swap2
pop
pop
jump(0x51)
label7:
label8:
pop
jump`
    st.equal(disassemble(code), asm)
  })
})
