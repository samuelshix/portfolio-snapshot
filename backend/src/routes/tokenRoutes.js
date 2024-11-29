const express = require('express');
const { getToken, setToken, getPricesForToken, createTokenPrice } = require('../controllers/tokenController');

const router = express.Router();

router.get('/token', getToken);
router.post('/setToken', setToken);
router.get('/tokenPrices', getPricesForToken);
router.post('/createTokenPrice', createTokenPrice);

module.exports = router;