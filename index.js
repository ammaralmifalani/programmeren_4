const express = require('express');
require('dotenv').config();
const app = express();
const port = process.env.PORT;
const userRouter = require('./src/routes/user.routes');
const mealRouter = require('./src/routes/meal.routes');
const authRouter = require('./src/routes/auth.routes');
const logger = require('./src/test/utils/utils').logger;

// Parse JSON requests
app.use(express.json());

app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} - ${req.method} Request: ${req.url}`
  );
  logger.debug(`Request Method: ${req.method}`);
  logger.debug(`Request URL: ${req.url}`);
  next();
});

// Catch all routes and log their method and URL
app.use('*', (req, res, next) => {
  const method = req.method;
  const url = req.originalUrl;
  logger.trace(`methode ${method} is aangeroepen for URL: ${url}`);
  next();
});
// Route: welcome message
app.get('/', (req, res) => {
  res.send('welcome to server API van de share a meal');
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
app.use('/api/meal', mealRouter);
app.use('/api/auth', authRouter);

// Catch all other routes that do not match any endpoints
app.use('*', (req, res) => {
  logger.warn('Invalid endpoint called: ', req.path);
  res.status(404).json({
    status: 404,
    message: 'Endpoint not found',
    data: {},
  });
});

// Express error handler
app.use((error, req, res, next) => {
  logger.error(error.status, error.message);
  res.status(error.status).json({
    status: error.status,
    message: error.message,
    data: {},
  });
});
// Start the server on the specified port
app.listen(port, () => {
  logger.info(` Server API van de share a meal listening on port ${port}`);
});
// Export the server for use in tests
module.exports = app;
