// routes/apiRoutes.js
const express = require('express');
const { client } = require('../services/elasticSearch.service');
const { syncEmailsInMailbox, syncEmails, getAccessToken } = require('../services/email.service');
const OutlookProvider = require('../services/emailProviders/outLookProvider.service');

const router = express.Router();

router.get('/emails', async (req, res) => {
  try {
    const response = await client.search({
      index: 'emails_'+req.query.userId,
      body: {
        sort: [
          { receivedDateTime: { order: 'desc' } }
        ],
        size: 10 // Number of emails to fetch
      }
    });

    if(response?.hits){
      const { hits } = response;
      const emailList = hits.hits.map(hit => hit._source);
  
      res.json({
        status: "Success",
        data: emailList,
      });
    }
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/mailboxes', async (req, res) => {
  try {
    const response = await client.search({
      index: 'mailboxes_'+req.query.userId,
      body: { query: { match_all: {} } }
    });

    if(response?.hits){
      const { hits } = response;
      const emailboxes = hits.hits.map(hit => ({
        id: hit._id,
        ...hit._source
      }));
  
      res.json({
        status: "Success",
        data: emailboxes,
      });
    }
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/email/webhook', async (req, res) => {
  const wss = req.wss; // WebSocketServer instance
  const { value } = req.body;
  const { validationToken } = req.query;
  
  // Handle subscription validation request
  if (validationToken) {
    console.log('Received subscription validation request');
    return res.status(200).send(validationToken);
  }

  if (value && Array.isArray(value)) {
    for (const notification of value) {
      try {
        const { subscriptionId, clientState, subscriptionExpirationDateTime } = notification;
        console.log("Syncing....");

        const accessToken = await getAccessToken(clientState); // Ensure you have a valid token
        const provider = new OutlookProvider();
        
        // Check if subscription is expired
        const expirationTime = new Date(subscriptionExpirationDateTime).getTime();
        const currentTime = new Date().getTime();

        if (currentTime > expirationTime) {
          console.log('Subscription expired, renewing...');
          // Renew the subscription using the subscriptionId
          await provider.renewSubscription(subscriptionId, accessToken);
        } else {
          console.log('Subscription is still valid.');
        }
        
        // Sync emails for the user
        await syncEmails(clientState, wss);
        
        console.log("Syncing complete.");

      } catch (error) {
        console.error('Error scheduling sync:', error);
      }
    }
  }

  res.sendStatus(200);
});


module.exports = router;
