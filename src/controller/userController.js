const fun = require('../controller/function');
const assert = require('assert');
const { database, meal_database } = require('../database/inmemdb');
const dbconnection = require('../database/dbconnection');
const logger = require('../test/utils/utils').logger;


// userController handles the routes for creating, updating, deleting, and retrieving user data
const userController = {
  
  // getAllUsers retrieves all users from the database
  getAllUsers: (req, res, next) => {
    logger.info('Get all users');

    let sqlStatement = 'SELECT * FROM `user`';
    // Hier wil je misschien iets doen met mogelijke filterwaarden waarop je zoekt.
    if (req.query.isactive) {
      // voeg de benodigde SQL code toe aan het sql statement
      // bv sqlStatement += " WHERE `isActive=?`"
    }

    dbconnection.getConnection(function (err, conn) {
      // Do something with the connection
      if (err) {
        console.log('error', err);
        next('error: ' + err.message);
      }
      if (conn) {
        conn.query(sqlStatement, function (err, results, fields) {
          if (err) {
            logger.err(err.message);
            next({
              status: 409,
              message: err.message,
              data: {},
            });
          }
          if (results) {
            logger.info('Found', results.length, 'results');
            res.status(200).json({
              status: 200,
              message: 'User getAll endpoint',
              data: results,
            });
          }
        });
        dbconnection.releaseConnection(conn);
      }
    });
  },
  // CreateUser creates a new user and adds it to the database
  createUser: (req, res) => {
    const newUser = ({
      firstName,
      lastName,
      isActive,
      emailAdress,
      password,
      phoneNumber,
      roles,
      street,
      city,
    } = req.body);
    logger.debug('user = ', newUser);

    // validation of email address
    if (!fun.validateEmail(newUser.emailAdress)) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid email address',
        data: {},
      });
    }

    // Validation of phone number
    if (newUser.phoneNumber) {
      if (!fun.validatePhoneNumber(newUser.phoneNumber)) {
        return res.status(400).json({
          status: 400,
          message: 'Invalid phone number. Phone number must be 10 digits long.',
          data: {},
        });
      }
    }

    // Validation of password

    if (!fun.validatePassword(newUser.password)) {
      return res.status(400).json({
        status: 400,
        message:
          'Invalid password. The password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number and a special character.',
        data: {},
      });
    }

    if (
      !newUser.firstName ||
      !newUser.lastName ||
      !newUser.emailAdress ||
      !newUser.password ||
      !newUser.street ||
      !newUser.city
    ) {
      return res.status(400).json({
        status: 400,
        message: 'Required fields missing',
        data: {},
      });
    }
    // Validate the types of fields
    const fieldTypes = {
      firstName: 'string',
      lastName: 'string',
      emailAdress: 'string',
      password: 'string',
      phoneNumber: 'string',
      street: 'string',
      city: 'string',
    };

    for (const field in fieldTypes) {
      const expectedType = fieldTypes[field];
      const actualType = typeof newUser[field];

      if (actualType !== expectedType) {
        return res.status(400).json({
          status: 400,
          message: `Invalid field type: ${field} should be of type ${expectedType}, but it is of type ${actualType}.`,
          data: {},
        });
      }
    }
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
            res.status(409).json({
              status: 409,
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
                message: `User with email address ${newUser.emailAdress} is registered`,
                data: fetchResults[0], // assuming the query returns an array
              });
            }
          );
        }
      });
    });
  },
  // deleteUser deletes a user from the database based on their email and password
  deleteUser: (req, res, next) => {
    logger.info('Deleting user');
    let sqlStatement = 'SELECT * FROM `user` WHERE  emailAdress=?';
    let emailAdress = req.body.emailAdress;
    logger.info('emailAddress =', emailAdress);
    dbconnection.getConnection(function (err, conn) {
      if (err) {
        console.log('error', err);
        next('error: ' + err.message);
      }
      if (conn) {
        conn.query(
          sqlStatement,
          [emailAdress],
          function (err, results, fields) {
            if (err) {
              logger.error(err.message);
              next({
                status: 409,
                message: err.message,
              });
              return;
            }
            if (results.length === 0) {
              logger.error('Email address is incorrect');
              res.status(404).json({
                status: 404,
                message: 'user not found',
                data: {},
              });
              return;
            }

            let deletedUser = results[0];
            sqlStatement = 'DELETE FROM `user` WHERE  emailAdress=?';
            conn.query(
              sqlStatement,
              [emailAdress],
              function (err, results, fields) {
                if (err) {
                  logger.error(err.message);
                  next({
                    status: 409,
                    message: err.message,
                  });
                  return;
                }
                if (results) {
                  logger.info('Deleted user with emailAdress', emailAdress);
                  res.status(200).json({
                    status: 200,
                    message: 'User deleted successfully',
                    data: deletedUser,
                  });
                }
              }
            );
          }
        );
        dbconnection.releaseConnection(conn);
      }
    });
  },
  // updateUser updates a user's information in the database based on their email and password
  updateUser: (req, res) => {
    const { emailAdress, updateData } = req.body;
    console.log('Request body:', req.body);

    dbconnection.getConnection((err, connection) => {
      if (err) throw err;

      const getUserSql = 'SELECT * FROM user WHERE emailAdress = ?';
      connection.query(getUserSql, [emailAdress], (error, results) => {
        if (error) {
          connection.release();
          throw error;
        }
        logger.debug('Query result:', results);

        if (results.length === 0) {
          connection.release();
          return res.status(404).json({
            status: 404,
            message: 'User is not found',
            data: {},
          });
        }

        const user = results[0];
        const { firstName, lastName, street, city, newPassword, phoneNumber } =
          updateData;

        const updatedUser = {
          ...user,
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
          street: street || user.street,
          city: city || user.city,
        };
        // Check if phoneNumber is present in the updateData and update it even if it is empty
        if (phoneNumber !== undefined) {
          updatedUser.phoneNumber = phoneNumber;
        }
        if (firstName && typeof firstName !== 'string') {
          connection.release();
          return res.status(400).json({
            status: 400,
            message: 'first name should be text.',
            data: {},
          });
        }

        if (lastName && typeof lastName !== 'string') {
          connection.release();
          return res.status(400).json({
            status: 400,
            message: 'Last name should be a text.',
            data: {},
          });
        }

        if (street && typeof street !== 'string') {
          connection.release();
          return res.status(400).json({
            status: 400,
            message: 'Street should be a text.',
            data: {},
          });
        }

        if (city && typeof city !== 'string') {
          connection.release();
          return res.status(400).json({
            status: 400,
            message: 'City should be a text.',
            data: {},
          });
        }
        if (newPassword) {
          if (!fun.validatePassword(newPassword)) {
            connection.release();
            return res.status(400).json({
              status: 400,
              message:
                'Invalid password. The password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number and a special character.',
              data: {},
            });
          } else {
            updatedUser.password = newPassword;
          }
        }
        if (phoneNumber && !fun.validatePhoneNumber(phoneNumber)) {
          connection.release();
          return res.status(400).json({
            status: 400,
            message:
              'Invalid phone number. Phone number must be 10 digits long.',
            data: {},
          });
        }

        const updateSql = `
          UPDATE user
          SET firstName = ?, lastName = ?, street = ?, city = ?, password = ?, phoneNumber = ?
          WHERE emailAdress = ?
        `;
        const updateValues = [
          updatedUser.firstName,
          updatedUser.lastName,
          updatedUser.street,
          updatedUser.city,
          updatedUser.password,
          updatedUser.phoneNumber,
          emailAdress,
        ];

        connection.query(updateSql, updateValues, (updateError) => {
          connection.release();

          if (updateError) {
            throw updateError;
          } else {
            res.status(200).json({
              status: 200,
              message: 'User information updated successfully',
              data: updatedUser,
            });
          }
        });
      });
    });
  },
  // getUserProfile retrieves a user's profile information based on their email and password
  getUserProfile: (req, res) => {
    const emailAdress = req.body.emailAdress;

    if (!fun.validateEmail(emailAdress)) {
      return res.status(400).json({
        status: 400,
        message: 'Email address not valid',
        data: {},
      });
    }

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      const userSql = 'SELECT * FROM user WHERE emailAdress = ?';

      connection.query(
        userSql,
        [emailAdress],
        function (error, userResults, fields) {
          connection.release();
          if (error) throw error;

          if (userResults.length === 0) {
            res.status(404).json({
              status: 404,
              message: 'User not found',
              data: {},
            });
          } else {
            const user = userResults[0];
            const userDetails = {
              firstName: user.firstName,
              lastName: user.lastName,
              emailAdress: user.emailAdress,
              password: user.password,
              street: user.street,
              city: user.city,
              phoneNumber: user.phoneNumber,
            };
            res.status(200).json({
              status: 200,
              message: 'Profile data retrieved',
              data: userDetails,
            });
          }
        }
      );
    });
  },
  // getUserById retrieves a user's public information and associated meals based on their user ID
  getUserById: (req, res) => {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid user ID',
        data: {},
      });
    }

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      const userSql =
        'SELECT firstName, lastName, emailAdress, phoneNumber,roles,isActive FROM user WHERE id = ?';
      const mealSql = 'SELECT * FROM meal WHERE CookID = ?';

      connection.query(userSql, [id], function (error, userResults, fields) {
        if (error) throw error;

        if (userResults.length === 0) {
          connection.release();
          res.status(404).json({
            status: 404,
            message: 'User not found',
            data: {},
          });
        } else {
          connection.query(
            mealSql,
            [id],
            function (error, mealResults, fields) {
              connection.release();

              if (error) throw error;

              const meals = mealResults.map((result) => {
                return {
                  id: result.id,
                  name: result.name,
                  description: result.description,
                  dateTime: result.dateTime,
                  maxAmountOfParticipants: result.maxAmountOfParticipants,
                  price: result.price,
                  imageUrl: result.imageUrl,
                  cookId: result.cookId,
                  createDate: result.createDate,
                  updateDate: result.updateDate,
                  allergenes: result.allergenes,
                  isVega: result.isVega,
                  isVegan: result.isVegan,
                  isToTakeHome: result.isToTakeHome,
                };
              });

              const userData = { ...userResults[0], meals };

              res.status(200).json({
                status: 200,
                message: 'User found',
                data: userData,
              });
            }
          );
        }
      });
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
