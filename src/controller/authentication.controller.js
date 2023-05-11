const assert = require('assert');
const jwt = require('jsonwebtoken');
const dbconnection = require('../database/dbconnection');
const { logger, jwtSecretKey } = require('../test/utils/utils');

module.exports = {
  login(req, res, next) {
    dbconnection.getConnection((err, connection) => {
      if (err) {
        logger.error('Error getting connection from pool');
        next({
          status: 500,
          message: err.code,
          data: {},
        });
      }
      if (connection) {
        const { emailAdress, password } = req.body;
        connection.query(
          'SELECT * FROM users WHERE emailAdress = ?',
          [emailAdress],
          function (error, results, fields) {
            connection.release();
            if (error) {
              next({
                status: 500,
                message: err.code,
                data: {},
              });
            } else if (!results.length || results[0].password !== password) {
              res
                .status(401)
                .json({ status: 401, message: 'Not Authorized', data: {} });
            } else {
              const payload = { userId: results[0].id };
              const token = jwt.sign(payload, jwtSecretKey, {
                expiresIn: '1h',
              });
              res.status(200).json({
                status: 200,
                message: 'Authentication successful!',
                data: { token: token },
              });
            }
          }
        );
      }
    });
  },
   /**
   * Validatie functie voor /api/login,
   * valideert of de vereiste body aanwezig is.
   */
   validateLogin(req, res, next) {
    // Verify that we receive the expected input
    try {
      assert(
        typeof req.body.emailAdress === 'string',
        'emailAdress must be a string.'
      );
      assert(
        typeof req.body.password === 'string',
        'password must be a string.'
      );
      next();
    } catch (ex) {
      res.status(422).json({
        status: 422,
        message: ex.toString(),
        data : new Date().toISOString()
      });
    }
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
