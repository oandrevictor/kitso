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
    email.html = "<div style='width:90%; margin-left:auto; margin-right:auto; margin-bottom: 20px; border: 1px solid transparent; border-radius: 4px;'>" +
            "<div style='font-family: Arial; border-color: #502274;'>" +
            "<div style='vertical-align:middle; text-align:justify;'>" +
            "<p style='text-align:left;'>Olá!</p>" + 
            "<p>Você está recebendo esse e-mail que foi requisitada a alteração da sua senha de acesso. Se você não fez nenhuma requisição, pode simplesmente ignorar este e-mail.</p>" +
              "<p>Para confirmar a alteração da senha, clique no botão abaixo:</p>" + 
                "<form action ='http://www.localhost:8080/passwordRecover/" + req.body.email + "' method='post'>" +
                "<input type='submit' value='Confirmar alteração de senha' style='margin-top:3px; margin-bottom:3px; background: #502274; margin-bottom: 3px; padding: 10px; text-align: center; color: white; font-weight: bold; border: 1px solid #502274;'></form>" +
                "<p style='text-align:left;' >Bom uso,</p>" + 
                "<p style='text-align:left;' ><b>Equipe Kitso!</b></p>" + 
                "</div></div></div>"

    transport.sendMail(email)
      .catch((err) => {
        res.status(400).send(err);
      })
      .then((info) => {
        res.status(200).send("Email sent!");
      });
}
