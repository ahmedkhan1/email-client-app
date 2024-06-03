class BaseEmailProvider {
    constructor() {}
  
    // Get OAuth URL
    async getOAuthUrl() {
      throw new Error("getOAuthUrl() must be implemented by the provider");
    }
  
    // Handle OAuth callback and fetch tokens
    async handleOAuthCallback(res, callbackParams) {
      throw new Error("handleOAuthCallback() must be implemented by the provider");
    }
  
    // Fetch emails
    async fetchEmails(accessToken) {
      throw new Error("fetchEmails() must be implemented by the provider");
    }

    async getUserInfo(accessToken) {
      throw new Error("getUserInfo() must be implemented by the provider");
    }
}
  
  module.exports = BaseEmailProvider;
  