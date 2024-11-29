const express = require('express');
const { getUser, createUserIfNotExists } = require('../controllers/userController');
const router = express.Router();

router.get('/', getUser);
router.post('/newUser', createUserIfNotExists)

module.exports = router;
