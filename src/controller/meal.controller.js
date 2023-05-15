const fun = require('../controller/function');
const dbconnection = require('../database/dbconnection');
const logger = require('../test/utils/utils').logger;

// userController handles the routes for creating, updating, deleting, and retrieving user data
const mealController = {
  validateMeal: (req, res, next) => {
    logger.info('Validating meal');
    const meal = req.body;
    const requiredFields = [
      'name',
      'description',
      'price',
      'maxAmountOfParticipants',
      'imageUrl',
      'dateTime',
    ];
    const fieldTypes = {
      name: 'string',
      description: 'string',
      price: 'number',
      maxAmountOfParticipants: 'number',
      imageUrl: 'string',
      dateTime: 'string',
    };

    for (let field of requiredFields) {
      if (!meal[field]) {
        return next({
          status: 400,
          message: `missing meal ${field}`,
          data: {},
        });
      }
      if (typeof meal[field] !== fieldTypes[field]) {
        return next({
          status: 400,
          message: `meal ${field} must be a ${fieldTypes[field]}`,
          data: {},
        });
      }
      if (typeof meal[field] === 'string' && meal[field].trim() === '') {
        return next({
          status: 400,
          message: `the ${field} of the meal must not be blank`,
          data: {},
        });
      }
    }
    next();
  },
  // getAllMeals retrieves all users from the database
  getAllMeals: (req, res, next) => {
    logger.info('Get all meals');

    let sqlStatement = `
      SELECT 
        meal.*,
        cook.id as cookId,
        cook.firstName as cookFirstName,
        cook.lastName as cookLastName,
        cook.isActive as cookIsActive,
        cook.emailAdress as cookEmailAdress,
        cook.phoneNumber as cookPhoneNumber,
        cook.roles as cookRoles,
        cook.street as cookStreet,
        cook.city as cookCity,
        participant.id as participantId,
        participant.firstName as participantFirstName,
        participant.lastName as participantLastName,
        participant.isActive as participantIsActive,
        participant.emailAdress as participantEmailAdress,
        participant.phoneNumber as participantPhoneNumber,
        participant.roles as participantRoles,
        participant.street as participantStreet,
        participant.city as participantCity
      FROM meal
      LEFT JOIN user as cook ON meal.cookId = cook.id
      LEFT JOIN meal_participants_user ON meal.id = meal_participants_user.mealId
      LEFT JOIN user as participant ON meal_participants_user.userId = participant.id
    `;

    dbconnection.getConnection(function (err, conn) {
      if (err) {
        console.log('error', err);
        next('error: ' + err.message);
      }
      if (conn) {
        conn.query(sqlStatement, function (err, results, fields) {
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
            let meals = [];
            results.forEach((result) => {
              let meal = {
                id: result.id,
                name: result.name,
                description: result.description,
                isActive: result.isActive,
                isVega: result.isVega,
                isVegan: result.isVegan,
                isToTakeHome: result.isToTakeHome,
                dateTime: result.dateTime,
                createDate: result.createDate,
                updateDate: result.updateDate,
                maxAmountOfParticipants: result.maxAmountOfParticipants,
                price: result.price,
                imageUrl: result.imageUrl,
                allergenes: result.allergenes,
                cook: {
                  id: result.cookId,
                  firstName: result.cookFirstName,
                  lastName: result.cookLastName,
                  isActive: result.cookIsActive,
                  emailAdress: result.cookEmailAdress,
                  phoneNumber: result.cookPhoneNumber,
                  roles: result.cookRoles,
                  street: result.cookStreet,
                  city: result.cookCity,
                },
                participants: result.participantId
                  ? [
                      {
                        id: result.participantId,
                        firstName: result.participantFirstName,
                        lastName: result.participantLastName,
                        isActive: result.participantIsActive,
                        emailAdress: result.participantEmailAdress,
                        phoneNumber: result.participantPhoneNumber,
                        roles: result.participantRoles,
                        street: result.participantStreet,
                        city: result.participantCity,
                      },
                    ]
                  : [],
              };
              meals.push(meal);
            });

            res.status(200).json({
              status: 200,
              message: 'Meal getAll endpoint',
              data: meals,
            });
          }
        });
        dbconnection.releaseConnection(conn);
      }
    });
  },

  // getAllMeals: (req, res, next) => {
  //   logger.info('Get all meals');

  //   let sqlStatement = 'SELECT * FROM `meal`';

  //   dbconnection.getConnection(function (err, conn) {
  //     // Do something with the connection
  //     if (err) {
  //       console.log('error', err);
  //       next('error: ' + err.message);
  //     }
  //     if (conn) {
  //       conn.query(sqlStatement, function (err, results, fields) {
  //         if (err) {
  //           logger.err(err.message);
  //           next({
  //             status: 409,
  //             message: err.message,
  //             data: {},
  //           });
  //         }
  //         if (results) {
  //           logger.info('Found', results.length, 'results');
  //           res.status(200).json({
  //             status: 200,
  //             message: 'Meal getAll endpoint',
  //             data: results,
  //           });
  //         }
  //       });
  //       dbconnection.releaseConnection(conn);
  //     }
  //   });
  // },
  // CreateUser creates a new user and adds it to the database
  createMeal: (req, res, next) => {
    logger.trace('Create a new Meal');
    const meal = req.body;
    const userId = req.userId;
    logger.debug('meal: ' + JSON.stringify(meal));

    let sqlInsertStatement =
      'INSERT INTO `meal` ( `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
      '(?,?,?,?,?,?,?)';

    dbconnection.getConnection(function (err, connection) {
      if (err) {
        logger.error('Database error:', err);
        return res.status(500).json({
          status: 500,
          message: 'Database error',
          data: {},
        });
      }
      if (connection) {
        connection.query(
          sqlInsertStatement,
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
              // Handle the error here
            }
            if (result) {
              const id = result.insertId;
              logger.trace('Meal successfully Added, id = ' + id);

              // SQL statement to select the just inserted meal
              let sqlSelectStatement = 'SELECT * FROM `meal` WHERE `id` = ?';
              connection.query(
                sqlSelectStatement,
                [id],
                (err, result, fields) => {
                  if (err) {
                    // Handle the error here
                  }
                  if (result && result.length > 0) {
                    res.status(200).json({
                      status: 200,
                      message: 'New Meal added successfully',
                      data: result[0],
                    });
                  }
                }
              );
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
  updateMeal: (req, res) => {},
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
