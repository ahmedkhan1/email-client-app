const express = require('express');
const { createAccount, callback } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/create_account', createAccount);
router.get('/callback', callback);

module.exports = router;
