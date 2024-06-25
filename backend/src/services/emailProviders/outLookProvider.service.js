const BaseEmailProvider = require('./baseProvider.service');
const config = require('../../config');
const { createUser } = require('../../models/user.model');
const axios = require('axios');
const { updateTokens } = require('../email.service');

class OutlookProvider extends BaseEmailProvider {
  callbackUrl = "https://login.microsoftonline.com/common/oauth2/v2.0";
  graphUrl = "https://graph.microsoft.com";

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
    const response = await axios.get(`${this.graphUrl}/v1.0/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
  }

  async fetchEmails(accessToken) {

  }
}

module.exports = OutlookProvider;

  