const express = require('express');
require('dotenv').config();
const app = express();
const port = process.env.PORT;
const userRouter = require('./src/routes/routes');
const logger = require('./src/test/utils/utils').logger;

// Parse JSON requests
app.use(express.json());

// Catch all routes and log their method and URL
app.use('*', (req, res, next) => {
  const method = req.method;
  const url = req.originalUrl;
  logger.trace(`methode ${method} is aangeroepen for URL: ${url}`);
  next();
});

// Define a route for server info
app.get('/api/info', (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'server info-endpoint',
    data: {
      studentName: 'Ammar Almifalani',
      studentNumber: 2206669,
      description: 'welkom bij de server API van de share a meal',
    },
  });
});

// Refer to routes defined in userRouter
app.use('/api/user', userRouter);

// Catch all other routes that do not match any endpoints
app.use((req, res, next) => {
  const url = req.originalUrl;
  logger.warn('Invalid endpoint called: ', req.path);
  res.status(404).json({
    status: 404,
    message: 'Endpoint not found',
    data: {},
  });
});
// Start the server on the specified port
app.listen(port, () => {
  logger.info(` Server API van de share a meal listening on port ${port}`);
});
// Export the server for use in tests
module.exports = app;
