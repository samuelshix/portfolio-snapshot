const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());

const userRoutes = require('./src/routes/userRoutes');
const tokenAccountRoutes = require('./src/routes/tokenAccountRoutes');
const tokenRoutes = require('./src/routes/tokenRoutes');

app.use('/api/users', userRoutes);
app.use('/api/token-accounts', tokenAccountRoutes);
app.use('/api/tokens', tokenRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
