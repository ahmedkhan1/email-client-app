const OutlookProvider = require('../services/emailProviders/outLookProvider.service');

const getProvider = (providerName) => {
  switch (providerName) {
    case 'Outlook':
      return new OutlookProvider();

    default:
      throw new Error('Unsupported provider');
  }
};

const createAccount = async(req, res) => {
  const { provider } = req.body;
  try {
    const emailProvider = getProvider(provider);
    const authUrl = await emailProvider.getOAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating OAuth URL:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const callback = async (req, res) => {
  try {
    const { state, code } = req.query;

    // Parse the state parameter to get provider
    const { provider } = JSON.parse(state);

    const emailProvider = getProvider(provider);
    emailProvider.handleOAuthCallback(res, code);

  } catch (error) {
    console.  error('Error handling OAuth callback:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { createAccount, callback };
