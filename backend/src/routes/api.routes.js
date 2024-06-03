// routes/apiRoutes.js
const express = require('express');
const { client } = require('../services/elasticSearch.service');

const router = express.Router();

router.get('/emails', async (req, res) => {
  try {
    const response = await client.search({
      index: 'emails_'+req.query.userId,
      body: { query: { match_all: {} } }
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

module.exports = router;
