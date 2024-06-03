// services/cronService.js
const cron = require('node-cron');
const { syncEmails } = require('./email.service');

module.exports = (client, checkConnection) => {
  cron.schedule('* * * * *', async () => {
    console.log("Syncing....");
    try{
      const response = await client.search({
          index: 'users',
          body: { query: { match_all: {} } }
      });
    
      if(response?.hits){
        console.log(response);
        const { hits } = response;
        for (const user of hits.hits) {
          const userId = user._id;
          await syncEmails(userId);
        }
        console.log("Syncing complete.");
      } else{
        console.log("Syncing complete. No new records");
      } 
    } catch(error){
      console.log("Error in syncing:", error);
    }
  });
  
  checkConnection();
}

