const axios = require('axios');
const config = require('../config');

const getOutlookAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: config.OUTLOOK_CLIENT_ID,
    response_type: 'code',
    redirect_uri: config.OUTLOOK_REDIRECT_URI,
    response_mode: 'query',
    scope: 'https://graph.microsoft.com/.default'
  });

  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
};

const getAccessToken = async (authCode) => {
  const response = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', new URLSearchParams({
    client_id: config.OUTLOOK_CLIENT_ID,
    client_secret: config.OUTLOOK_CLIENT_SECRET,
    code: authCode,
    redirect_uri: config.OUTLOOK_REDIRECT_URI,
    grant_type: 'authorization_code'
  }));
  return response.data.access_token;
};

const getUserInfo = async (accessToken) => {
  const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
};

module.exports = { getOutlookAuthUrl, getAccessToken, getUserInfo };
