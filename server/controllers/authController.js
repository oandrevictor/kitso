exports.login = function(req, res) {
  res.status(200).send('Logged in!');
}

exports.logout = function(req, res) {
  req.logout();
  res.status(200).send('Logged out!')
}

exports.status = function(req, res) {
  if (req.user) {
      res.status(200).send(true);
  } else {
      res.status(400).send(false);
  }
}