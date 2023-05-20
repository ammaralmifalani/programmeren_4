const dbconnection = require('../database/dbconnection');
const logger = require('../test/utils/utils').logger;
const fun = require('./function');

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
    logger.debug(`Request Method: ${req.method}`);
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
        logger.error('Database connection error:', err);
        return res.status(500).json({
          status: 500,
          message: err.message,
          data: {},
        });
      }
      if (conn) {
        conn.query(sqlStatement, function (err, results, fields) {
          if (err) {
            logger.error('Database query error:', err);
            return res.status(500).json({
              status: 500,
              message: err.message,
              data: {},
            });
          }
          if (results) {
            logger.info('Found', results.length, 'results');
            let meals = [];
            results.forEach((result) => {
              let meal = fun.convertMealProperties({
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
                cook: fun.convertIsActiveToBoolean({
                  id: result.cookId,
                  firstName: result.cookFirstName,
                  lastName: result.cookLastName,
                  isActive: result.cookIsActive,
                  emailAdress: result.cookEmailAdress,
                  phoneNumber: result.cookPhoneNumber,
                  roles: result.cookRoles,
                  street: result.cookStreet,
                  city: result.cookCity,
                }),
                participants: result.participantId
                  ? [
                      fun.convertIsActiveToBoolean({
                        id: result.participantId,
                        firstName: result.participantFirstName,
                        lastName: result.participantLastName,
                        isActive: result.participantIsActive,
                        emailAdress: result.participantEmailAdress,
                        phoneNumber: result.participantPhoneNumber,
                        roles: result.participantRoles,
                        street: result.participantStreet,
                        city: result.participantCity,
                      }),
                    ]
                  : [],
              });
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
  // CreateUser creates a new user and adds it to the database
  createMeal: (req, res, next) => {
    logger.info('Create a new Meal');
    const meal = req.body;
    const userId = req.userId;
    logger.debug('meal: ' + JSON.stringify(meal));

    function isMySQLDateTimeFormat(dateTime) {
      const mysqlDateTimeFormat =
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{6})?$/;
      return mysqlDateTimeFormat.test(dateTime);
    }

    if (!isMySQLDateTimeFormat(meal.dateTime)) {
      let date = new Date(meal.dateTime);
      meal.dateTime = date.toISOString().slice(0, 19).replace('T', ' ');
    }
    logger.debug('Formatted Meal.dateTime: ', meal.dateTime);

    let sqlInsertStatement =
      'INSERT INTO `meal` ( `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
      '(?,?,?,?,?,?,?)';

    dbconnection.getConnection(function (err, connection) {
      logger.debug('Entered getConnection method');
      if (err) {
        logger.error('Database connection error:', err);
        return res.status(500).json({
          status: 500,
          message: err.message,
          data: {},
        });
      }

      if (connection) {
        logger.debug('Database connection established');
        try {
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
                logger.error('Database query error:', err);
                return res.status(500).json({
                  status: 500,
                  message: err.message,
                  data: {},
                });
              }

              if (result) {
                const id = result.insertId;
                logger.info('Meal successfully Added, id = ' + id);

                // SQL statement to select the just inserted meal
                let sqlSelectStatement = 'SELECT * FROM `meal` WHERE `id` = ?';
                connection.query(
                  sqlSelectStatement,
                  [id],
                  (err, result, fields) => {
                    if (err) {
                      logger.error('Database query error:', err);
                      return res.status(500).json({
                        status: 500,
                        message: err.message,
                        data: {},
                      });
                    }

                    if (result && result.length > 0) {
                      logger.info('Meal successfully retrieved after addition');
                      res.status(201).json({
                        status: 201,
                        message: 'Meal successfully added.',
                        data: fun.convertMealProperties(result[0]),
                      });
                    }
                  }
                );
              }
            }
          );
        } finally {
          logger.debug('Releasing database connection');
          dbconnection.releaseConnection(connection);
        }
      }
    });
  },

  // deleteMeal deletes a meal from the database
  deleteMeal: (req, res, next) => {
    const mealId = req.params.mealId;
    const userId = req.userId;

    logger.info(
      `Attempting to delete meal with ID: ${mealId} by user ID: ${userId}`
    );
    logger.debug(`Request Method: ${req.method}`);

    dbconnection.getConnection(function (err, connection) {
      logger.debug('Entered getConnection method');
      if (err) {
        logger.error('Database connection error:', err);
        return res.status(500).json({
          status: 500,
          message: err.message,
          data: {},
        });
      }
      logger.debug('Database connection established');

      connection.query(
        'SELECT * FROM `meal` WHERE id = ?',
        [mealId],
        function (err, results) {
          logger.debug('Retrieved meal information');
          if (err) {
            logger.error('Database query error:', err);
            connection.release();
            return res.status(500).json({
              status: 500,
              message: err.message,
              data: {},
            });
          }

          if (results.length > 0) {
            logger.debug('Meal found');
            if (results[0].cookId !== userId) {
              logger.debug('User not authorized to delete this meal');
              next({
                status: 403,
                message: 'Not authorized to delete this meal',
                data: {},
              });
              return;
            }

            connection.query(
              'DELETE FROM meal WHERE id = ? AND cookId = ?',
              [mealId, userId],
              function (err, results) {
                logger.debug('Attempted to delete meal');
                if (err) {
                  logger.error('Database query error:', err);
                  connection.release();
                  return res.status(500).json({
                    status: 500,
                    message: err.message,
                    data: {},
                  });
                }
                if (results.affectedRows > 0) {
                  logger.debug('Meal deleted successfully');
                  res.status(200).json({
                    status: 200,
                    message: `Maaltijd met ID ${mealId} is verwijderd`,
                    data: {},
                  });
                }
              }
            );
          } else {
            logger.debug('Meal not found');
            connection.release();
            next({
              status: 404,
              message: 'Meal not found',
              data: {},
            });
          }
        }
      );
    });
  },

  updateMeal: (req, res, next) => {
    let mealId = req.params.mealId;
    let userId = req.userId;
    logger.debug(`Request Method: ${req.method}`);
    logger.debug(`Request Body: ${JSON.stringify(req.body)}`);
    logger.debug('USER ID:', userId);
    logger.debug('MEAL ID:', mealId);

    dbconnection.getConnection(function (err, connection) {
      if (err) {
        logger.error('Database connection error:', err);
        return res.status(500).json({
          status: 500,
          message: err.message,
          data: {},
        });
      }
      logger.debug('Database connection established');

      connection.query(
        'SELECT * FROM meal WHERE id = ?',
        [mealId],
        function (error, results, fields) {
          if (error) {
            logger.error('Database query error:', error);
            return res.status(500).json({
              status: 500,
              message: error.message,
              data: {},
            });
          }
          logger.debug('Retrieved meal information');
          // Check if meal exists
          if (results.length === 0) {
            logger.debug('Meal not found');
            return res.status(404).json({
              status: 404,
              message: 'Meal not found',
              data: {},
            });
          }
          // Check if user is updating their own meal
          if (results[0].cookId != userId) {
            logger.debug('User is not the creator of the meal');
            return res.status(403).json({
              status: 403,
              message: 'You can only update your own meals',
              data: {},
            });
          }

          // Combine current meal values with new ones from request body
          let updatedMeal = {
            ...results[0],
            ...req.body,
          };
          // If updatedMeal.allergenes is an array, join it into a string
          if (Array.isArray(updatedMeal.allergenes)) {
            updatedMeal.allergenes = updatedMeal.allergenes.join(',');
          }
          const sql = `
          UPDATE meal
          SET name = ?, description = ?, isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, dateTime = ?, maxAmountOfParticipants = ?, price = ?, imageUrl = ?, allergenes = ?
          WHERE id = ?
        `;
          const values = [
            updatedMeal.name,
            updatedMeal.description,
            updatedMeal.isActive,
            updatedMeal.isVega,
            updatedMeal.isVegan,
            updatedMeal.isToTakeHome,
            updatedMeal.dateTime,
            updatedMeal.maxAmountOfParticipants,
            updatedMeal.price,
            updatedMeal.imageUrl,
            updatedMeal.allergenes,
            mealId,
          ];
          logger.debug(
            'Updating meal with allergenes:',
            updatedMeal.allergenes
          );
          connection.query(sql, values, function (error, results, fields) {
            if (error) {
              logger.error('Database query error:', error);
              return res.status(500).json({
                status: 500,
                message: error.message,
                data: {},
              });
            }
            logger.debug('Meal updated in the database');

            connection.query(
              'SELECT * FROM meal WHERE id = ?',
              [mealId],
              function (error, results, fields) {
                if (error) {
                  logger.error('Database query error:', error);
                  return res.status(500).json({
                    status: 500,
                    message: error.message,
                    data: {},
                  });
                }
                logger.debug('Retrieved updated meal information');

                res.status(200).json({
                  status: 200,
                  message: `Meal successfully updated`,
                  data: fun.convertMealProperties(results[0]),
                });

                connection.release();
              }
            );
          });
        }
      );
    });
  },
  // getMealById
  getMealById: (req, res, next) => {
    const requestedMealId = req.params.mealId;
    logger.debug(`Request Method: ${req.method}`);
    logger.info('Requested meal id: ', requestedMealId);

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
      WHERE meal.id = ?
    `;

    dbconnection.getConnection(function (err, conn) {
      if (err) {
        logger.error('Database connection error:', err);
        return res.status(500).json({
          status: 500,
          message: err.message,
          data: {},
        });
      }

      if (conn) {
        conn.query(
          sqlStatement,
          [requestedMealId],
          function (err, results, fields) {
            if (err) {
              logger.error('Database query error:', err);
              return res.status(500).json({
                status: 500,
                message: err.message,
                data: {},
              });
            }

            if (results && results.length > 0) {
              let meal = fun.convertMealProperties({
                id: results[0].id,
                name: results[0].name,
                description: results[0].description,
                isActive: results[0].isActive,
                isVega: results[0].isVega,
                isVegan: results[0].isVegan,
                isToTakeHome: results[0].isToTakeHome,
                dateTime: results[0].dateTime,
                createDate: results[0].createDate,
                updateDate: results[0].updateDate,
                maxAmountOfParticipants: results[0].maxAmountOfParticipants,
                price: results[0].price,
                imageUrl: results[0].imageUrl,
                allergenes: results[0].allergenes,
                cook: fun.convertIsActiveToBoolean({
                  id: results[0].cookId,
                  firstName: results[0].cookFirstName,
                  lastName: results[0].cookLastName,
                  isActive: results[0].cookIsActive,
                  emailAdress: results[0].cookEmailAdress,
                  phoneNumber: results[0].cookPhoneNumber,
                  roles: results[0].cookRoles,
                  street: results[0].cookStreet,
                  city: results[0].cookCity,
                }),
                participants: results[0].participantId
                  ? [
                      fun.convertIsActiveToBoolean({
                        id: results[0].participantId,
                        firstName: results[0].participantFirstName,
                        lastName: results[0].participantLastName,
                        isActive: results[0].participantIsActive,
                        emailAdress: results[0].participantEmailAdress,
                        phoneNumber: results[0].participantPhoneNumber,
                        roles: results[0].participantRoles,
                        street: results[0].participantStreet,
                        city: results[0].participantCity,
                      }),
                    ]
                  : [],
              });

              res.status(200).json({
                status: 200,
                message: 'Meal found',
                data: meal,
              });
            } else {
              next({
                status: 404,
                message: 'Meal not found',
                data: {},
              });
            }

            dbconnection.releaseConnection(conn);
          }
        );
      }
    });
  },
  participateInMeal: (req, res, next) => {
    let mealId = req.params.mealId;
    let userId = req.userId;
    logger.info(
      `User ${userId} is attempting to participate in meal with ID: ${mealId}`
    );
    dbconnection.getConnection(function (err, connection) {
      if (err) {
        logger.error('Database connection error:', err);
        return res.status(500).json({
          status: 500,
          message: err.message,
          data: {},
        });
      }
      logger.debug('Database connection established');

      connection.query(
        'SELECT * FROM meal WHERE id = ?;',
        [mealId],
        function (error, mealResults, fields) {
          if (error) {
            connection.release();
            logger.error('Database query error:', error);
            return res.status(500).json({
              status: 500,
              message: error.message,
              data: {},
            });
          }
          logger.debug('Retrieved meal information');

          if (mealResults.length > 0) {
            const maxParticipants = mealResults[0].maxAmountOfParticipants;

            connection.query(
              'SELECT * FROM meal_participants_user WHERE mealId = ?;',
              [mealId],
              function (error, participantResults, fields) {
                if (error) {
                  connection.release();
                  logger.error('Database query error:', error);
                  return res.status(500).json({
                    status: 500,
                    message: error.message,
                    data: {},
                  });
                }
                logger.debug('Retrieved participant information');

                if (participantResults.length < maxParticipants) {
                  connection.query(
                    'INSERT INTO meal_participants_user (userId, mealId) VALUES (?, ?);',
                    [userId, mealId],
                    function (error, insertResults, fields) {
                      if (error) {
                        connection.release();
                        logger.error('Database query error:', error);
                        return res.status(500).json({
                          status: 500,
                          message: error.message,
                          data: {},
                        });
                      }
                      logger.debug('User registered for meal');
                      res.status(200).json({
                        status: 200,
                        message: `User met ID ${userId} is aangemeld voor maaltijd met ID ${mealId}`,
                        data: {},
                      });
                    }
                  );
                } else {
                  connection.release();
                  logger.debug('Maximum participants reached for meal');
                  res.status(403).json({
                    status: 403,
                    message:
                      'Maximum aantal deelnemers voor deze maaltijd is bereikt',
                    data: {},
                  });
                }
              }
            );
          } else {
            connection.release();
            logger.debug('No meal found with provided ID');
            res.status(404).json({
              status: 404,
              message: 'Meal not found',
              data: {},
            });
          }
        }
      );
    });
  },

  withdrawFromMeal: (req, res, next) => {
    let mealId = req.params.mealId;
    let userId = req.userId;
    logger.info(
      `Attempting to withdraw user ${userId} from meal with ID: ${mealId}`
    );
    dbconnection.getConnection(function (err, connection) {
      logger.debug('Entered getConnection method');
      if (err) {
        logger.error('Database connection error:', err);
        return res.status(500).json({
          status: 500,
          message: err.message,
          data: {},
        });
      }
      logger.debug('Database connection established');
      logger.debug('About to run SELECT * FROM meal WHERE id = ? query');
      connection.query(
        'SELECT * FROM meal WHERE id = ?;',
        [mealId],
        function (error, results, fields) {
          logger.debug(
            'Finished running SELECT * FROM meal WHERE id = ? query'
          );

          if (error) {
            logger.error('Database query error:', error);
            connection.release();
            return res.status(500).json({
              status: 500,
              message: error.message,
              data: {},
            });
          }
          logger.debug('Retrieved meal information');

          if (results.length > 0) {
            connection.query(
              'SELECT * FROM meal_participants_user WHERE mealId = ?;',
              [mealId],
              function (error, results, fields) {
                if (error) {
                  logger.error('Database query error:', error);
                  connection.release();
                  return res.status(500).json({
                    status: 500,
                    message: error.message,
                    data: {},
                  });
                }
                logger.debug('Retrieved participant information');

                if (results.length > 0) {
                  connection.query(
                    'DELETE FROM meal_participants_user WHERE userId = ? AND mealId = ?;',
                    [userId, mealId],
                    function (error, results, fields) {
                      if (error) {
                        connection.release();
                        logger.error('Database query error:', error);
                        return res.status(500).json({
                          status: 500,
                          message: error.message,
                          data: {},
                        });
                      }
                      logger.debug('User withdrawn from meal');
                      res.status(200).json({
                        status: 200,
                        message: `User met ID ${userId} is afgemeld voor maaltijd met ID ${mealId}`,
                        data: {},
                      });
                    }
                  );
                } else {
                  connection.release();
                  logger.debug('No registration found for user');
                  res.status(404).json({
                    status: 404,
                    message: 'Registration does not exist',
                    data: {},
                  });
                }
              }
            );
          } else {
            connection.release();
            logger.debug('No meal found with provided ID');
            res.status(404).json({
              status: 404,
              message: 'Meal not found',
              data: {},
            });
          }
        }
      );
    });
  },

  getParticipants: (req, res, next) => {
    let mealId = req.params.mealId;
    logger.info('Getting participants for meal with id: ', mealId);
    dbconnection.getConnection(function (err, connection) {
      if (err) {
        logger.error('Error connecting to the database: ', err);
        return next(err);
      }
      connection.query(
        'SELECT * FROM meal WHERE id = ?;',
        [mealId],
        function (error, results, fields) {
          if (error) {
            logger.error('Error executing query: ', error);
            return next(error);
          }

          if (results.length > 0) {
            connection.query(
              'SELECT user.id, user.firstName, user.lastName, user.isActive, user.emailAdress, user.phoneNumber, user.roles, user.street, user.city FROM meal_participants_user ' +
                'JOIN user ON meal_participants_user.userId = user.id ' +
                'WHERE meal_participants_user.mealId = ?;',
              [mealId],
              function (error, results, fields) {
                if (error) {
                  logger.error('Error executing query: ', error);
                  return next(error);
                }
                res.status(200).json({
                  status: 200,
                  message: `Participants for meal with ID ${mealId}`,
                  data: results,
                });
              }
            );
          } else {
            const error = {
              status: 404,
              message: 'Meal not found',
              data: {},
            };
            next(error);
          }
        }
      );
    });
  },
  getParticipantById: (req, res, next) => {
    let mealId = req.params.mealId;
    let participantId = req.params.participantId;
    logger.info(
      `Getting details for participant with id: ${participantId} for meal with id: ${mealId}`
    );
    dbconnection.getConnection(function (err, connection) {
      if (err) {
        logger.error('Error connecting to the database: ', err);
        return next(err);
      }
      connection.query(
        'SELECT * FROM meal WHERE id = ?;',
        [mealId],
        function (error, results, fields) {
          if (error) {
            logger.error('Error executing query: ', error);
            return next(error);
          }

          if (results.length > 0) {
            connection.query(
              'SELECT user.id, user.firstName, user.lastName, user.isActive, user.emailAdress, user.phoneNumber, user.roles, user.street, user.city FROM meal_participants_user ' +
                'JOIN user ON meal_participants_user.userId = user.id ' +
                'WHERE meal_participants_user.mealId = ? AND meal_participants_user.userId = ?;',
              [mealId, participantId],
              function (error, results, fields) {
                if (error) {
                  logger.error('Error executing query: ', error);
                  return next(error);
                }

                if (results.length > 0) {
                  res.status(200).json({
                    status: 200,
                    message: `Details for participant with ID ${participantId} for meal with ID ${mealId}`,
                    data: results[0],
                  });
                } else {
                  const error = {
                    status: 404,
                    message: 'Participant not found',
                  };
                  next(error);
                }
              }
            );
          } else {
            const error = {
              status: 404,
              message: 'Meal not found',
            };
            next(error);
          }
        }
      );
    });
  },
};

// Export the userController object, making its methods available for use in other modules
module.exports = mealController;
