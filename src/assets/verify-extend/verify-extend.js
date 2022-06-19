import reg from 'reg-verify-fast'

// console.log(reg)
reg.extend('isDate', function (s) {
  return reg.type(s) === 'date'
})

reg.extend('isContainA', function (s) {
  return reg.type(s) === 'string' && s.includes('A')
})

export default reg
