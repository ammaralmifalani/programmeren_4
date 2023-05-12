const fun = require('../controller/function');
const assert = require('assert');
const dbconnection = require('../database/dbconnection');
const userController = require('./userController');
const logger = require('../test/utils/utils').logger;

// userController handles the routes for creating, updating, deleting, and retrieving user data
const mealController = {
  // getAllMeals retrieves all users from the database
  getAllMeals: (req, res, next) => {
    logger.info('Get all meals');

    let sqlStatement = 'SELECT * FROM `meal`';
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
              message: 'Meal getAll endpoint',
              data: results,
            });
          }
        });
        dbconnection.releaseConnection(conn);
      }
    });
  },
  // CreateUser creates a new user and adds it to the database
  createMeal: (req, res, next) => {
    logger.trace('Create a new Meal');
    const meal = req.body;
    const userId = req.userId;
    logger.trace('meal: ' + meal);
    try {
    } catch (error) {}
    let sqlStatement =
      'INSERT INTO `meal` ( `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
      '(?,?,?,?,?,?,?),';

    dbconnection.getConnection(function (err, connection) {
      if (err) {
      }
      if (connection) {
        connection.query(
          sqlStatement,
          [
            meal.name,
            meal.description,
            meal.imageUrl,
            meal.dateTime,
            meal.maxAmountOfParticipants,
            meal.price,
            userId,
          ],
          (err, result, fields) => {
            if (err) {
            }
            if (result) {
              logger.trace('Meal successfully Added, id = ' + result.id);
              const newMeal = {
                id: result[0].insertId,
                ...meal,
              };
              res.status(200).json({
                status: 200,
                message: 'New Meal added successfully',
                data: newMeal,
              });
            }
          }
        );
      }
    });
  },
  // deleteUser deletes a user from the database based on their email and password
  deleteMeal: (req, res, next) => {
    const mealId = req.params.id;
    logger.trace('Deleting meal', mealId);
    let sqlStatement = 'DELETE * FROM `meal` WHERE  id=? AND cookId = ?';
    let userId = req.userId;
    logger.trace('userId =', userId);
    dbconnection.getConnection(function (err, conn) {
      if (err) {
        logger.error(err.code, err.syscall, err.address, err.port);
        next('error: ' + err.message);
      }
      if (conn) {
        conn.query(
          sqlStatement,
          [mealId, userId],
          function (err, results, fields) {
            if (err) {
              logger.error(err.message);
              next({
                status: 409,
                message: err.message,
              });
              return;
            }
            if (results && results.affectedRows === 1) {
              logger.trace('Deleted meal', results);
              res.status(200).json({
                status: 200,
                message: 'Meal deleted successfully',
                data: {},
              });
            } else {
              next({
                status: 401,
                message: 'Not Authorized',
                data: {},
              });
            }
          }
        );
        dbconnection.releaseConnection(conn);
      }
    });
  },
  // updateUser updates a user's information in the database based on their email and password
  updateMeal: (req, res) => {
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
  // getUserById retrieves a user's public information and associated meals based on their user ID
  getMealById: (req, res) => {
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
module.exports = mealController;
