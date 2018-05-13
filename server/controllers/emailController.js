var nodemailer = require('nodemailer');

var transport = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'kitsoapp@gmail.com',
    pass: 'kitsosavetv'
  }
});

var email = {
  from: 'kitsoapp@gmail.com',
  to: '',
  subject: 'Kitso Password Recover',
  html: 'E-mail foi enviado do <strong>Node.js</strong>'
};

exports.sendPasswordRecoverEmail = function(req, res) {
    email.to = req.body.email;
    transport.sendMail(email)
        .catch((err) => {
            res.status(400).send(err);
        })
        .then((info) => {
            res.status(200).send('Email sent, info: ', info);
        });
}
