const { syncEmails } = require('../services/email.service');

const syncEmailsController = async (req, res) => {
  const { userId, email } = req.params;
  await syncEmails(userId);
  res.redirect(`http://localhost:5000?userId=${userId}&&email=${email}`);
};

module.exports = { syncEmailsController };
