const axios = require('axios');
const { client } = require('./elasticSearch.service');
const config = require('../config');

const esClient = client;

const syncEmails = async (userId) => {
  const user = await esClient.get({ index: 'users', id: userId });
  const accessToken = user._source.accessToken;

  const headers = { Authorization: `Bearer ${accessToken}` };
  const mailboxesResponse = await axios.get('https://graph.microsoft.com/v1.0/me/mailFolders', { headers });
  const mailboxes = mailboxesResponse.data.value;

  for (const mailbox of mailboxes) {
    await storeMailbox(userId, mailbox);
    await syncEmailsInMailbox(userId, mailbox.id, accessToken);
  }
};

const syncEmailsInMailbox = async (userId, mailboxId, accessToken) => {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const emailsResponse = await axios.get(`https://graph.microsoft.com/v1.0/me/mailFolders/${mailboxId}/messages`, { headers });
  const emails = emailsResponse.data.value;

  for (const email of emails) {
    await storeEmail(userId, email);
  }
};

const storeEmail = async (userId, emailData) => {
  await esClient.index({
    index: `emails_${userId}`,
    id: emailData.id,
    document: emailData
  });
};

const storeMailbox = async (userId, mailboxData) => {
  await esClient.index({
    index: `mailboxes_${userId}`,
    id: mailboxData.id,
    document: mailboxData
  });
};

module.exports = { syncEmails };
