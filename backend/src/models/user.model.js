const { client } = require('../services/elasticSearch.service');
const config = require('../config');

const esClient = client;

const createUser = async (email, accessToken) => {
  const userId = generateUniqueId();
  const user = {
    email,
    accessToken
  };
  await esClient.index({
    index: 'users',
    id: userId,
    document: user
  });
  return userId;
};

const generateUniqueId = () => {
  return Math.random().toString(36).substring(2);
};

module.exports = { createUser };
