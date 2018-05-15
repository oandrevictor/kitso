var nodemailer = require('nodemailer');

var transport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'kitsoapp@gmail.com',
    pass: 'kitsosavetv'
  }
});

var email = {
  from: 'kitsoapp@gmail.com',
  to: '',
  subject: 'Kitso Password Recover',
  html: ''
};

exports.sendPasswordRecoverEmail = function(req, res) {
    email.to = req.body.email;
    //Mudar esse html pra ficar bonitinho no email e coloca o link do site no heroku
    email.html = 'Click on the link below to update your password to your new password:<br/><a href="http://www.localhost:8080/api/user/password/' + req.body.email + '"> Update Password </a><br/>Please do not reply to this email.';

    transport.sendMail(email)
      .catch((err) => {
        res.status(400).send(err);
      })
      .then((info) => {
        console.log(info);
        res.status(200).send("Email sent!");
      });
}
