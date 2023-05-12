const assert = require('assert');
const jwt = require('jsonwebtoken');
const dbconnection = require('../database/dbconnection');
const { logger, jwtSecretKey } = require('../test/utils/utils');
const fun = require('../controller/function');

module.exports = {
  login(req, res, next) {
    // Check if required fields are provided
    const credentials = {
      emailAdress: req.body.emailAdress,
      password: req.body.password,
    };

    if (!credentials.emailAdress || !credentials.password) {
      return res.status(400).json({
        status: 400,
        message: 'Missing email address or password',
        data: {},
      });
    }

    dbconnection.getConnection((err, connection) => {
      if (err) {
        logger.error('Error getting connection from pool');
        res.status(500).json({ status: 500, message: err.message, data: {} });
        return;
      }

      const { emailAdress, password } = credentials;

      connection.query(
        'SELECT * FROM user WHERE emailAdress = ?',
        [emailAdress],
        function (error, results, fields) {
          connection.release();
         
          console.log('emailAdress: ' + emailAdress);
          if (error) {
            res
              .status(500)
              .json({ status: 500, message: error.message, data: {} });
          } else if (!results.length) {
            res
              .status(404)
              .json({ status: 404, message: 'User not found', data: {} });
          } else if (results[0].password !== password) {
            res
              .status(401)
              .json({ status: 401, message: 'Invalid password', data: {} });
          } else {
            const payload = { userId: results[0].id };
            const token = jwt.sign(payload, jwtSecretKey, { expiresIn: '1h' });

            res.status(200).json({
              status: 200,
              message: 'Authentication successful!',
              data: { token },
            });
          }
        }
      );
    });
  },
  /**
   * Validatie functie voor /api/login,
   * valideert of de vereiste body aanwezig is.
   */
  validateLogin(req, res, next) {
    // Check if emailAdress exists, is a string, is not an empty string, and passes email validation
    if (!req.body.emailAdress || typeof req.body.emailAdress !== 'string' || req.body.emailAdress.trim() === '' || !fun.validateEmail(req.body.emailAdress)) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid email address.',
        data: new Date().toISOString(),
      });
    }
  
    // Check if password exists, is a string, is not an empty string, and passes password validation
    if (!req.body.password || typeof req.body.password !== 'string' || req.body.password.trim() === '' || !fun.validatePassword(req.body.password)) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid password.',
        data: new Date().toISOString(),
      });
    }
  
    // If both checks pass, proceed to the next middleware function
    next();
  },

  validateToken(req, res, next) {
    logger.trace('validateToken called');
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      next({
        status: 401,
        message: 'Authorization header missing!',
        data: undefined,
      });
    } else {
      const token = authHeader.split(' ')[1]; // Extract token from 'Bearer [token]'
      jwt.verify(token, jwtSecretKey, (err, payload) => {
        if (err) {
          next({
            status: 401,
            message: 'Token is not valid!',
            data: undefined,
          });
        } else {
          req.userId = payload.userId; // Attach userId from payload to request object
          next();
        }
      });
    }
  },
};
