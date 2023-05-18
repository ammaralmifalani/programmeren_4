const fun = require('./function');
const assert = require('assert');
const dbconnection = require('../database/dbconnection');
const logger = require('../test/utils/utils').logger;
const VALID_FIELDS = [
  'id',
  'firstName',
  'lastName',
  'emailAdress',
  'phoneNumber',
  'city',
  'street',
  'isActive',
  'roles',
];
function buildSqlStatement(queryField) {
  let sqlStatement =
    'SELECT id, firstName, lastName, emailAdress, password, phoneNumber, city, street, isActive, roles FROM `user`';
  let params = [];
  let conditions = [];
  let invalidFieldName = null;

  for (let field in queryField) {
    let value = queryField[field];

    if (!VALID_FIELDS.includes(field)) {
      invalidFieldName = field;
      break;
    }

    if (!value) continue;

    if (value.toLowerCase() === 'true') {
      value = 1;
    } else if (value.toLowerCase() === 'false') {
      value = 0;
    }

    conditions.push(`\`${field}\` = ?`);
    params.push(value);
  }

  if (invalidFieldName) {
    return { error: `Invalid field in filter: ${invalidFieldName}.` };
  }

  if (conditions.length > 0) {
    sqlStatement += ' WHERE ' + conditions.slice(0, 2).join(' AND ');
  }

  return { sqlStatement, params };
}
// userController handles the routes for creating, updating, deleting, and retrieving user data
const userController = {
  // getAllUsers retrieves all users from the database
  getAllUsers(req, res, next) {
    logger.trace('Get all users');
    const { error, sqlStatement, params } = buildSqlStatement(req.query);
    if (error) {
      res.status(400).json({ status: 400, message: error, data: {} });
      return;
    }

    dbconnection.getConnection(function (err, conn) {
      if (err) {
        logger.err('error', err);
        next('error: ' + err.message);
      }
      if (conn) {
        conn.query(sqlStatement, params, function (err, results, fields) {
          if (err) {
            logger.trace(err.message);
            next({
              status: 409,
              message: err.message,
              data: {},
            });
          }
          if (results) {
            logger.info('Found', results.length, 'results');
            for (let i = 0; i < results.length; i++) {
              results[i] = fun.convertIsActiveToBoolean(results[i]);
            }
            res.status(200).json({
              status: 200,
              message: 'Get All Users.',
              data: results,
            });
          }
        });
        dbconnection.releaseConnection(conn);
      }
    });
  },
  validateUser: (req, res, next) => {
    let user = req.body;
    logger.info('Validating user');

    const requiredFields = [
      'firstName',
      'lastName',
      'password',
      'street',
      'city',
      'emailAdress',
    ];
    const fieldTypes = {
      firstName: 'string',
      lastName: 'string',
      password: 'string',
      street: 'string',
      city: 'string',
      emailAdress: 'string',
    };

    for (let field of requiredFields) {
      if (!user[field]) {
        return next({ status: 400, message: `${field} is missing.`, data: {} });
      }
      if (typeof user[field] !== fieldTypes[field]) {
        return next({
          status: 400,
          message: `${field} must be a ${fieldTypes[field]}.`,
          data: {},
        });
      }
      if (typeof user[field] === 'string' && user[field].trim() === '') {
        return next({
          status: 400,
          message: `${field} must not be blank.`,
          data: {},
        });
      }
      if (field === 'password' && !fun.validatePassword(user[field])) {
        return next({ status: 400, message: 'Invalid password.', data: {} });
      }
      if (field === 'emailAdress' && !fun.validateEmail(user[field])) {
        return next({
          status: 400,
          message: 'Invalid email address.',
          data: {},
        });
      }
    }

    if (!fun.validatePhoneNumber(user.phoneNumber)) {
      return next({ status: 400, message: 'Invalid phone number.', data: {} });
    }

    next();
  },
  // validateUser: (req, res, next) => {
  //   let user = req.body;
  //   logger.info('Validating user');

  //   // Check if firstName exists, is a string, and is not an empty string
  //   if (
  //     !user.firstName ||
  //     typeof user.firstName !== 'string' ||
  //     user.firstName.trim() === ''
  //   ) {
  //     return res.status(400).json({
  //       status: 400,
  //       message: 'Invalid first name.',
  //       data: {},
  //     });
  //   }

  //   // Check if lastName exists, is a string, and is not an empty string
  //   if (
  //     !user.lastName ||
  //     typeof user.lastName !== 'string' ||
  //     user.lastName.trim() === ''
  //   ) {
  //     return res.status(400).json({
  //       status: 400,
  //       message: 'Invalid last name.',
  //       data: {},
  //     });
  //   }

  //   // Check if password exists, is a string, is not an empty string, and passes password validation
  //   if (
  //     !user.password ||
  //     typeof user.password !== 'string' ||
  //     user.password.trim() === '' ||
  //     !fun.validatePassword(user.password)
  //   ) {
  //     return res.status(400).json({
  //       status: 400,
  //       message: 'Invalid password.',
  //       data: {},
  //     });
  //   }

  //   // Check if street exists, is a string, and is not an empty string
  //   if (
  //     !user.street ||
  //     typeof user.street !== 'string' ||
  //     user.street.trim() === ''
  //   ) {
  //     return res.status(400).json({
  //       status: 400,
  //       message: 'Invalid street.',
  //       data: {},
  //     });
  //   }

  //   // Check if city exists, is a string, and is not an empty string
  //   if (
  //     !user.city ||
  //     typeof user.city !== 'string' ||
  //     user.city.trim() === ''
  //   ) {
  //     return res.status(400).json({
  //       status: 400,
  //       message: 'Invalid city.',
  //       data: {},
  //     });
  //   }

  //   // Check if emailAdress exists, is a string, is not an empty string, and passes email validation
  //   if (
  //     !user.emailAdress ||
  //     typeof user.emailAdress !== 'string' ||
  //     user.emailAdress.trim() === '' ||
  //     !fun.validateEmail(user.emailAdress)
  //   ) {
  //     return res.status(400).json({
  //       status: 400,
  //       message: 'Invalid email address.',
  //       data: {},
  //     });
  //   }
  //   //Check if phoneNumber exists, is a string, is not an empty string, and passes phone number validation
  //   if (!fun.validatePhoneNumber(user.phoneNumber)) {
  //     return res.status(400).json({
  //       status: 400,
  //       message: 'Invalid phone number.',
  //       data: {},
  //     });
  //   }

  //   // If all checks pass, proceed to the next middleware function
  //   next();
  // },
  // CreateUser creates a new user and adds it to the database
  createUser: (req, res) => {
    logger.trace('Create User');
    const newUser = ({
      firstName,
      lastName,
      emailAdress,
      password,
      street,
      city,
    } = req.body);
    logger.debug('user = ', newUser);

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      const sql = `
        INSERT INTO user (
          firstName, lastName, emailAdress, password,
          phoneNumber, street, city
        ) VALUES ( ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        newUser.firstName,
        newUser.lastName,
        newUser.emailAdress,
        newUser.password,
        newUser.phoneNumber || '',
        newUser.street,
        newUser.city,
      ];
      connection.query(sql, values, function (error, results, fields) {
        // When done with the connection, release it.
        if (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            // Send a custom error message to the user
            res.status(403).json({
              status: 403,
              message: 'A user already exists with this email address.',
              data: {},
            });
          } else {
            // Send the original error message if it is another error
            logger.info('#affectedRows= ', results.affectedRows);
            throw error;
          }
        } else {
          let user_id = results.insertId;

          // New SQL query to fetch the user data from the database
          const fetchSql = 'SELECT * FROM user WHERE id = ?';
          connection.query(
            fetchSql,
            [user_id],
            function (fetchError, fetchResults, fetchFields) {
              // Release the connection
              connection.release();

              // Handle error after the release
              if (fetchError) throw fetchError;

              // Send the fetched user data to the client
              res.status(201).json({
                status: 201,
                message: 'User successfully registered.',
                data: fun.convertIsActiveToBoolean(fetchResults[0]), // assuming the query returns an array
              });
            }
          );
        }
      });
    });
  },
  validateUpdate: (req, res, next) => {
    let user = req.body;
    logger.info('Validating update for user with id: ', req.userId);

    // Check if firstName exists, is a string, and is not an empty string
    if (
      !user.firstName ||
      typeof user.firstName !== 'string' ||
      user.firstName.trim() === ''
    ) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid first name.',
        data: {},
      });
    }

    // Check if lastName exists, is a string, and is not an empty string
    if (
      !user.lastName ||
      typeof user.lastName !== 'string' ||
      user.lastName.trim() === ''
    ) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid last name.',
        data: {},
      });
    }

    // Check if password exists, is a string, is not an empty string, and passes password validation
    if (
      !user.password ||
      typeof user.password !== 'string' ||
      user.password.trim() === '' ||
      !fun.validatePassword(user.password)
    ) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid password.',
        data: {},
      });
    }

    // Check if street exists, is a string, and is not an empty string
    if (
      !user.street ||
      typeof user.street !== 'string' ||
      user.street.trim() === ''
    ) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid street.',
        data: {},
      });
    }

    // Check if city exists, is a string, and is not an empty string
    if (
      !user.city ||
      typeof user.city !== 'string' ||
      user.city.trim() === ''
    ) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid city.',
        data: {},
      });
    }

    // Check if emailAdress exists, is a string, is not an empty string, and passes email validation
    if (
      !user.emailAdress ||
      typeof user.emailAdress !== 'string' ||
      user.emailAdress.trim() === '' ||
      !fun.validateEmail(user.emailAdress)
    ) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid email address.',
        data: {},
      });
    }

    //Check if phoneNumber exists, is a string, is not an empty string, and passes phone number validation
    if (!fun.validatePhoneNumber(user.phoneNumber)) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid phone number.',
        data: {},
      });
    }

    // If all checks pass, proceed to the next middleware function
    next();
  },
  // deleteUser deletes a user from the database
  deleteUser: (req, res, next) => {
    let id = req.params.id;
    let userId = req.userId;
    logger.info('Deleting user with id: ', id);

    dbconnection.getConnection(function (error, connection) {
      if (error) {
        logger.error('Error executing SELECT query:', error);
        throw err;
      }

      connection.query(
        'SELECT * FROM user WHERE id = ?',
        [id],
        function (error, results, fields) {
          if (error) {
            logger.error('Error executing SELECT query:', error);
            throw err;
          }
          logger.trace('User select results:', results);
          if (results.length > 0) {
            if (userId == id) {
              connection.query(
                `DELETE  FROM user WHERE id = ?`,
                [id],
                function (error, results, fields) {
                  if (error) {
                    logger.error('Error executing SELECT query:', error);
                    throw error;
                  }
                  connection.release();
                  logger.trace('User delete results:', results);
                  if (results.affectedRows > 0) {
                    res.status(200).json({
                      status: 200,
                      message: 'User successfully deleted',
                      data: {},
                    });
                  }
                }
              );
            } else {
              const error = {
                status: 403,
                message: 'Logged in user is not allowed to delete this user.',
                data: {},
              };
              next(error);
            }
          } else {
            const error = {
              status: 400,
              message: 'User not found',
              data: {},
            };
            next(error);
          }
        }
      );
    });
  },
  // updateUser updates a user's information in the database
  updateUser: (req, res, next) => {
    let id = req.params.id;
    let userId = req.userId;
    let {
      firstName,
      lastName,
      emailAdress,
      password,
      phoneNumber,
      isActive,
      street,
      city,
    } = req.body;

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      // Use the connection
      connection.query(
        'SELECT * FROM user WHERE id = ?',
        [id],
        function (error, results, fields) {
          if (error) throw error;

          // Check if user exists
          if (results.length === 0) {
            return res.status(404).json({
              status: 404,
              message: 'User not found',
              data: {},
            });
          }

          // Check if user is updating their own profile
          if (id != userId) {
            return res.status(403).json({
              status: 403,
              message: 'You can only update your own profile',
              data: {},
            });
          }

          const sql = `
          UPDATE user 
          SET firstName = ?, lastName = ?, isActive = ?, emailAdress = ?, password = ?, phoneNumber = ?, street = ?, city = ?
          WHERE id = ?
          `;
          const values = [
            firstName,
            lastName,
            isActive,
            emailAdress,
            password,
            phoneNumber,
            street,
            city,
            id,
          ];

          connection.query(sql, values, function (error, results, fields) {
            if (error) throw error;

            // Get the updated user details
            connection.query(
              'SELECT * FROM user WHERE id = ?',
              [id],
              function (error, results, fields) {
                if (error) throw error;

                // User was updated successfully
                res.status(200).json({
                  status: 200,
                  message: `User successfully updated`,
                  data: fun.convertIsActiveToBoolean(results[0]),
                });

                connection.release();
              }
            );
          });
        }
      );
    });
  },
  // getUserProfile retrieves a user's profile information based on their email and password
  getUserProfile: (req, res, next) => {
    let id = req.userId;
    logger.info('Getting profile for user with id: ', id);

    if (id) {
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err;

        connection.query(
          'SELECT * FROM user WHERE id = ?;',
          [id],
          function (error, results, fields) {
            connection.release();
            if (error) throw error;

            if (results.length > 0) {
              res.status(200).json({
                status: 200,
                message: 'User profile retrieved successfully',
                data: fun.convertIsActiveToBoolean(results[0]),
              });
            } else {
              const err = {
                status: 404,
                message: 'User not found',
                data: {},
              };
              next(err);
            }
          }
        );
      });
    } else {
      const error = {
        status: 401,
        message: 'No user logged in',
        data: {},
      };
      next(error);
    }
  },
  // getUserById retrieves a user's public information and associated meals based on their user ID
  getUserById: (req, res, next) => {
    let requestedUserId = req.params.id;
    logger.info('Requested user id: ', requestedUserId);

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      const userQuery =
        'SELECT firstName, lastName, emailAdress, phoneNumber, city, street,isActive,roles FROM user WHERE id = ?;';
      connection.query(
        userQuery,
        [requestedUserId],
        function (error, userResults, fields) {
          if (error) {
            throw error;
          }
          // TODO: meals die active zijn
          if (userResults.length > 0) {
            const mealsQuery = 'SELECT * FROM meal WHERE cookId = ?';
            connection.query(
              mealsQuery,
              [requestedUserId],
              function (mealError, mealResults, mealFields) {
                if (mealError) throw mealError;
                for (let i = 0; i < mealResults.length; i++) {
                  mealResults[i] = fun.convertMealProperties(mealResults[i]);
                }
                res.status(200).json({
                  status: 200,
                  message: 'User found',
                  data: {
                    ...fun.convertIsActiveToBoolean(userResults[0]),
                    meals: mealResults,
                  },
                });
              }
            );
          } else {
            const error = {
              status: 404,
              message: 'User not found',
              data: {},
            };
            next(error);
          }

          connection.release();
        }
      );
    });
  },

  // getTableLength retrieves the length of a table from the database
  getTableLength: (tableName, callback) => {
    dbconnection.getConnection((err, connection) => {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query(
        `SELECT COUNT(*) as count FROM ${tableName}`,
        (error, results, fields) => {
          // When done with the connection, release it.
          connection.release();
          // Handle error after the release.
          if (error) throw error;

          // Don't use the connection here, it has been returned to the pool.
          const tableLength = results[0].count;

          callback(null, tableLength);
        }
      );
    });
  },
};
// Export the userController object, making its methods available for use in other modules
module.exports = userController;
