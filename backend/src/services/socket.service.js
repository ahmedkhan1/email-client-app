// services/SocketService.js
const { syncEmails } = require('./email.service');
const { client } = require('./elasticSearch.service');
const WebSocket = require('ws');

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('Client connected');
  
    ws.on('message', (message) => {
      console.log('Received:', message);
    });
  
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
  
  
  // Schedule the sync to run every minute using setInterval
  setInterval(async () => {
    try {
      console.log("Syncing....");

      // Retrieve the list of users
      const response = await client.search({
        index: 'users',
        body: { query: { match_all: {} } }
      });

      if(response?.hits){
        const { hits } = response;

        for (const user of hits.hits) {
          const userId = user._id;
          await syncEmails(userId, wss);
        }
        console.log("Syncing complete.");
      } else{
        console.log("Syncing complete. No new records");
      } 
    } catch (error) {
      console.error('Error scheduling sync:', error);
    }
  }, 60000); // Sync every minute
  
}

