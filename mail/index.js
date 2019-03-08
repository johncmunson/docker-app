const Redis = require('ioredis')
const sub = new Redis(process.env.REDIS_PORT || 6379, 'redis')
const nodemailer = require('nodemailer')

// async..await is not allowed in global scope, must use a wrapper
async function main() {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let account = await nodemailer.createTestAccount()

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: account.user, // generated ethereal user
      pass: account.pass // generated ethereal password
    }
  })

  sub.subscribe('mail', function(err, count) {
    console.log('subscribed to redis mail channel')
  })

  sub.on('message', async function(channel, message) {
    const parsedMsg = JSON.parse(message)
    switch (channel) {
      case 'mail': {
        // send mail with defined transport object
        let info = await transporter.sendMail(parsedMsg)
        console.log('Message sent: %s', info.messageId)
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)) // Preview only available when sending through an Ethereal account
        break
      }
      default: {
      }
    }
  })
}

main().catch(console.error)
