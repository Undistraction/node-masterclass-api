const { pipe, when, trim, F, unless, both } = require(`ramda`)
const {
  isString,
  isNonEmptyString,
  lengthEq,
  lengthGt,
  isTrue,
} = require(`ramda-adjunct`)

const validators = {}

validators.firstName = pipe(
  when(isString, trim),
  unless(isNonEmptyString, F)
)

validators.lastName = pipe(
  when(isString, trim),
  unless(isNonEmptyString, F)
)

validators.phone = pipe(
  when(isString, trim),
  unless(both(isNonEmptyString, lengthEq(10)), F)
)

validators.password = pipe(
  when(isString, trim),
  unless(both(isNonEmptyString, lengthGt(0)), F)
)

validators.tosAgreement = pipe(unless(isTrue, F))

module.exports = validators
