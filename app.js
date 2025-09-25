const express = require('express');
const bodyParser = require('body-parser');
const db = require('./config/db');
const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
db();

// Routes
app.use('/api', routes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});