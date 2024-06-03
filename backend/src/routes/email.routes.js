const express = require('express');
const { syncEmailsController } = require('../controllers/email.controller');

const router = express.Router();

router.get('/sync_emails/:userId/:email', syncEmailsController);

module.exports = router;
