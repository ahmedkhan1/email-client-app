const BaseEmailProvider = require('./baseProvider.service');
const config = require('../../config');
const { createUser } = require('../../models/user.model');
const axios = require('axios');
const { updateTokens } = require('../email.service');

class OutlookProvider extends BaseEmailProvider {
  callbackUrl = "https://login.microsoftonline.com/common/oauth2/v2.0";
  graphUrl = "https://graph.microsoft.com/v1.0";

  constructor() {
    super();
  }

  async getOAuthUrl() {
    let params = new URLSearchParams({
      client_id: config.OUTLOOK_CLIENT_ID,
      response_type: 'code',
      redirect_uri: config.OUTLOOK_REDIRECT_URI,
      response_mode: 'query',
      scope: 'openid profile offline_access User.Read Mail.Read',
      state: JSON.stringify({ provider: 'Outlook'})
    });
    return `${this.callbackUrl}/authorize?${params.toString()}`;
  }

  async handleOAuthCallback(res, authCode) {
    const response = await axios.post(`${this.callbackUrl}/token`, new URLSearchParams({
      client_id: config.OUTLOOK_CLIENT_ID,
      client_secret: config.OUTLOOK_CLIENT_SECRET,
      code: authCode,
      redirect_uri: config.OUTLOOK_REDIRECT_URI,
      grant_type: 'authorization_code'
    }));

    const { access_token, refresh_token, expires_in } = response.data;
    const userInfo = await this.getUserInfo(access_token);
    const userId = await createUser(userInfo.mail, access_token, refresh_token, expires_in);

    // Create Subscription for Email events
    this.createSubscription(access_token, userId);

    if(userId) {
      res.redirect(`/email/sync_emails/${userId}/${userInfo.mail}`);
    } else {
      res.json({
        status: "Failed",
        messsage: "An error occured"
      });
    }
  }

  async getUserInfo(accessToken) {
    const response = await axios.get(`${this.graphUrl}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
  }

  async createSubscription(accessToken, userId) {
    try {
      const response = await axios.post(`${this.graphUrl}/subscriptions`, {
        changeType: 'created,updated,deleted',
        notificationUrl: process.env.API_URL + '/api/email/webhook', // Your endpoint to receive notifications
        resource: '/me/messages', // Subscribe to message changes
        expirationDateTime: new Date(new Date().getTime() + 3600 * 1000).toISOString(), // 1-hour expiration
        clientState: userId, // Optional, for additional security
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
  
      console.log('Subscription created:', response.data);
    } catch (error) {
      console.error('Error creating subscription:', error.response.data);
    }
  }

  async renewSubscription(subscriptionId, accessToken) {
    try {
      const response = await axios.patch(`${this.graphUrl}/subscriptions/${subscriptionId}`, {
        expirationDateTime: new Date(new Date().getTime() + 3600 * 1000).toISOString()
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
  
      console.log('Subscription renewed:', response.data);
    } catch (error) {
      console.error('Error renewing subscription:', error.response.data);
    }
  };
  
}

module.exports = OutlookProvider;

  