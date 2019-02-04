const zxcvbn = require('zxcvbn')
const Isemail = require('isemail')

module.exports.checkPasswordStrength = function(pw) {
  return zxcvbn(pw).score // rates password strength from 1 to 4
}

module.exports.checkEmailValidity = function(email) {
  return Isemail.validate(email)
}
