// services/elasticsearchService.js
const { Client } = require('@elastic/elasticsearch');
const config = require('../config');

const client = new Client({
  node: config.ELASTICSEARCH_URL,
  auth: {
    username: config.ELASTICSEARCH_USERNAME,
    password: config.ELASTICSEARCH_PASSWORD
  }
});

const checkConnection = async () => {
  try {
    await client.ping();
    console.log('Connected to Elasticsearch');
  } catch (error) {
    console.error('Elasticsearch connection failed:', error);
  }
};

module.exports = { client, checkConnection };
