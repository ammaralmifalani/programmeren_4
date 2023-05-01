const fun = require('../controller/function');
const assert = require('assert');
const { database, meal_database } = require('../database/inmemdb');
const dbconnection = require('../database/dbconnection');
const logger = require('../test/utils/utils').logger;
let index = database.users.length;

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
        message: 'Ongeldig e-mailadres',
        data: {},
      });
    }

    // Validatie van telefoonnummer
    if (newUser.phoneNumber) {
      if (!fun.validatePhoneNumber(newUser.phoneNumber)) {
        return res.status(400).json({
          status: 400,
          message:
            'Ongeldig telefoonnummer. Het telefoonnummer moet 10 cijfers lang zijn.',
          data: {},
        });
      }
    }

    // Validatie van wachtwoord

    if (!fun.validatePassword(newUser.password)) {
      return res.status(400).json({
        status: 400,
        message:
          'Ongeldig wachtwoord. Het wachtwoord moet minstens 8 tekens lang zijn, een hoofdletter, een kleine letter, een cijfer en een speciaal teken bevatten.',
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
        message: 'Vereiste velden ontbreken',
        data: {},
      });
    }
    // Valideer de types van de velden
    const fieldTypes = {
      firstName: 'string',
      lastName: 'string',
      isActive: 'number',
      emailAdress: 'string',
      password: 'string',
      phoneNumber: 'string',
      roles: 'string',
      street: 'string',
      city: 'string',
    };

    for (const field in fieldTypes) {
      const expectedType = fieldTypes[field];
      const actualType = typeof newUser[field];

      if (actualType !== expectedType) {
        return res.status(400).json({
          status: 400,
          message: `Ongeldig veldtype: ${field} moet van het type ${expectedType} zijn, maar het is van het type ${actualType}.`,
          data: {},
        });
      }
    }
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      const sql = `
        INSERT INTO user (
          firstName, lastName, isActive, emailAdress, password,
          phoneNumber, roles, street, city
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        newUser.firstName,
        newUser.lastName,
        newUser.isActive || 0,
        newUser.emailAdress,
        newUser.password,
        newUser.phoneNumber || '',
        newUser.roles || '',
        newUser.street,
        newUser.city,
      ];

      connection.query(sql, values, function (error, results, fields) {
        // When done with the connection, release it.
        connection.release();

        // Handle error after the release.
        if (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            // Stuur een aangepaste foutmelding naar de gebruiker
            res.status(409).json({
              status: 409,
              message: 'Er bestaat al een gebruiker met dit e-mailadres.',
              data: {},
            });
          } else {
            // Stuur de oorspronkelijke foutmelding als het een andere fout is been returned to the pool.
            logger.info('#affectedRows= ', results.affectedRows);
            throw error;
          }
        } else {
          // Don't use the connection here, it has
          let user_id = results.insertId;
          res.status(201).json({
            status: 201,
            message: `Gebruiker met e-mailadres ${newUser.emailAdress} is geregistreerd`,
            data: {
              id: user_id,
              ...req.body,
            },
          });
        }
      });
    });
  },
  // deleteUser deletes a user from the database based on their email and password
  deleteUser: (req, res, next) => {
    logger.info('Deleting user');

    let sqlStatement = 'SELECT * FROM `user` WHERE  emailAdress=?';
    let emailAdress = req.body.emailAdress;
    let password = req.body.password;
    logger.info('emailAddress =', emailAdress);
    logger.info('password =', password);
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
            }
            if (results.length === 0) {
              logger.error('Email address is incorrect');
              res.status(401).json({
                status: 401,
                message: 'Email address is incorrect',
                data: {},
              });
            }
            if (results.length > 0) {
              if (results[0].password !== password) {
                logger.error('Password is incorrect');
                res.status(401).json({
                  status: 401,
                  message: 'Password is incorrect',
                  data: {},
                });
              }
              if (results[0].password === password) {
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
            }
          }
        );
        dbconnection.releaseConnection(conn);
      }
    });
  },
  // updateUser updates a user's information in the database based on their email and password
  updateUser: (req, res) => {
    const { emailAdress, password, updateData } = req.body;
    console.log('Request body:', req.body);

    dbconnection.getConnection((err, connection) => {
      if (err) throw err;

      const getUserSql = 'SELECT * FROM user WHERE emailAdress = ?';
      connection.query(getUserSql, [emailAdress], (error, results) => {
        if (error) {
          connection.release();
          throw error;
        }
        console.log('Query result:', results);

        if (results.length === 0) {
          connection.release();
          return res.status(404).json({
            status: 404,
            message: 'User is not found',
            data: {},
          });
        }

        const user = results[0];
        if (user.password !== password) {
          connection.release();
          return res.status(401).json({
            status: 401,
            message: 'Invalid password',
            data: {},
          });
        }

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
    const { emailAdress, password } = req.body;

    if (typeof emailAdress !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        status: 400,
        message: 'E-mailadres en wachtwoord moeten een tekenreeks zijn',
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
              message: 'Gebruiker niet gevonden',
              data: {},
            });
          } else {
            const user = userResults[0];

            if (user.password !== password) {
              res.status(401).json({
                status: 401,
                message: 'Ongeldig wachtwoord',
                data: {},
              });
            } else {
              const userDetails = {
                firstName: user.firstName,
                lastName: user.lastName,
                emailAdress: user.emailAdress,
                password: user.password,
                street: user.street,
                city: user.city,
                phonenumber: user.phonenumber,
              };

              res.status(200).json({
                status: 200,
                message: 'Profielgegevens opgehaald',
                data: userDetails,
              });
            }
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
        message: 'Ongeldige gebruikers-ID',
        data: {},
      });
    }

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      const userSql =
        'SELECT firstName, lastName, emailAdress, phoneNumber FROM user WHERE id = ?';
      const mealSql = 'SELECT * FROM meal WHERE CookID = ?';

      connection.query(userSql, [id], function (error, userResults, fields) {
        if (error) throw error;

        if (userResults.length === 0) {
          connection.release();
          res.status(404).json({
            status: 404,
            message: 'Gebruiker niet gevonden',
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
                message: 'Gebruiker gevonden',
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
  // loginUser logs in a user based on their email address and password
  loginUser: (req, res) => {
    const { emailaddress, password } = req.body;
    logger.debug(`Login request received for email: ${emailaddress}`);

    // Find the user with the provided email address
    const user = database.users.find(
      (user) => user.emailaddress === emailaddress
    );

    // Return a 404 status if the user is not found
    if (!user) {
      logger.warn(`User not found for email: ${emailaddress}`);
      return res
        .status(404)
        .json({ status: 404, message: 'Gebruiker niet gevonden', data: {} });
    }

    // Check if the provided password matches the stored password for the user
    if (user.password !== password) {
      logger.warn(`Invalid password for email: ${emailaddress}`);
      return res
        .status(401)
        .json({ status: 401, message: 'Ongeldig wachtwoord', data: {} });
    }

    // Log the successful login and return a success message
    logger.info(`User with email ${emailaddress} successfully logged in.`);
    res.status(200).json({
      status: 200,
      message: 'Gebruiker is met succes ingelogd',
      data: {},
    });
  },
};
// Export the userController object, making its methods available for use in other modules
module.exports = userController;
