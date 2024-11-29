const express = require('express');
const { createTokenAccount } = require('../controllers/tokenAccountController');

const router = express.Router();

router.post('/createTokenAccount', createTokenAccount);

module.exports = router;