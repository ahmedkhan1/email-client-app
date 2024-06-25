const axios = require('axios');
const { client } = require('./elasticSearch.service');
const config = require('../config');

const esClient = client;

// Sync emails function
const syncEmails = async (userId, wss) => {
  try {
    // Retrieve user data from Elasticsearch
    const userResponse = await esClient.get({ index: 'users', id: userId });
    const user = userResponse._source;
    let { accessToken, refreshToken, tokenExpiry } = user;

    // Check if the access token is expired
    if (isTokenExpired(tokenExpiry)) {
      console.log('Access token expired, refreshing...');
      const newTokens = await refreshAccessToken(refreshToken);
      accessToken = newTokens.access_token;
      refreshToken = newTokens.refresh_token;
      const expiresIn = newTokens.expires_in;

      // Update tokens in the database
      await updateTokens(userId, accessToken, refreshToken, expiresIn);
    }

    const headers = { Authorization: `Bearer ${accessToken}` };

    // Make a request to the Microsoft Graph API to get mail folders
    const mailboxesResponse = await axios.get('https://graph.microsoft.com/v1.0/me/mailFolders', { headers });

    if (mailboxesResponse.status !== 200) {
      throw new Error(`Failed to fetch mail folders. Status: ${mailboxesResponse.status}`);
    }

    const mailboxes = mailboxesResponse.data.value;

    // Process each mailbox
    for (const mailbox of mailboxes) {
      await storeMailbox(userId, mailbox);
      await syncEmailsInMailbox(userId, mailbox.id, accessToken);
    }
    if(wss){
      // Notify frontend about the sync completion
      broadcast(wss, { type: 'syncComplete', userId });
    }
  } catch (error) {
    // Handle and log errors
    console.error('Error syncing emails:', error);
  }

};

// Broadcast function to send messages to all connected clients
const broadcast = (wss, data) => {
  wss.clients.forEach((client) => {
      if (client.readyState === 1) {
          client.send(JSON.stringify(data));
      }
  });
};


const syncEmailsInMailbox = async (userId, mailboxId, accessToken) => {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const emailsResponse = await axios.get(`https://graph.microsoft.com/v1.0/me/mailFolders/${mailboxId}/messages?$orderby=receivedDateTime desc`, { headers });
  const emails = emailsResponse.data.value;

  for (const email of emails) {
    await storeEmail(userId, email);
  }

  // try{
  //   // Fetch deleted items to handle deletions
  //   const deletedItemsResponse = await axios.get(`https://graph.microsoft.com/v1.0/me/mailFolders/deletedItems/messages?$filter=receivedDateTime ge ${emails[emails.length - 1].receivedDateTime}`, { headers });
  //   const deletedItems = deletedItemsResponse.data.value;

  //   // Delete emails that are in deletedItems mailbox from the current mailbox index
  //   for (const deletedEmail of deletedItems) {
  //     await deleteEmail(userId, deletedEmail.id);
  //   }
  // }catch(err){
  //   console.log("error deleting:");
  // }
};

const storeEmail = async (userId, emailData) => {
  await esClient.index({
    index: `emails_${userId}`,
    id: emailData.id,
    body: {
      ...emailData,
      receivedDateTime: new Date(emailData.receivedDateTime).getTime() // Convert to timestamp for easier sorting
    }
  });
};

const storeMailbox = async (userId, mailboxData) => {
  await esClient.index({
    index: `mailboxes_${userId}`,
    id: mailboxData.id,
    document: mailboxData
  });
};

const isTokenExpired = (tokenExpiry) => {
  return new Date().getTime() > tokenExpiry;
};

const refreshAccessToken = async (refreshToken) => {
  const params = new URLSearchParams({
    client_id: config.OUTLOOK_CLIENT_ID,
    client_secret: config.OUTLOOK_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
    redirect_uri: config.OUTLOOK_REDIRECT_URI
  });

  const response = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  return response.data;
};

const updateTokens = async (userId, newAccessToken, newRefreshToken, expiresIn) => {
  const tokenExpiry = new Date().getTime() + expiresIn * 1000; // expiresIn is typically in seconds
  await esClient.update({
    index: 'users',
    id: userId,
    body: {
      doc: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        tokenExpiry: tokenExpiry
      }
    }
  });
};

const deleteEmail = async (userId, emailId) => {
  await esClient.delete({
    index: `emails_${userId}`,
    id: emailId
  });
};

module.exports = { 
  syncEmails, 
  isTokenExpired, 
  refreshAccessToken, 
  updateTokens, 
  storeMailbox, 
  syncEmailsInMailbox 
};
