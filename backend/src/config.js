require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  ELASTICSEARCH_USERNAME: process.env.ELASTICSEARCH_USERNAME,
  ELASTICSEARCH_PASSWORD: process.env.ELASTICSEARCH_PASSWORD,
  OUTLOOK_CLIENT_ID: process.env.OUTLOOK_CLIENT_ID,
  OUTLOOK_CLIENT_SECRET: process.env.OUTLOOK_CLIENT_SECRET,
  OUTLOOK_REDIRECT_URI: process.env.OUTLOOK_REDIRECT_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'supersecretkey'
};
