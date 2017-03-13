var test = require('tape')

var utils = require('../babelify-src/app/utils')

test('util.groupBy on valid input', function (t) {
  t.plan(1)

  var result = utils.groupBy([
    {category: 'GAS', name: 'a'},
    {category: 'SEC', name: 'b'},
    {category: 'GAS', name: 'c'}

  ], 'category')

  var expectedResult = {
    'GAS': [
      {category: 'GAS', name: 'a'},
      {category: 'GAS', name: 'c'}
    ],
    'SEC': [
      {category: 'SEC', name: 'b'}
    ]
  }

  t.deepEqual(result, expectedResult)
})
