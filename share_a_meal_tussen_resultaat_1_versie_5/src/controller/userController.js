const fun = require('../controller/function');
const assert = require('assert');
const { database, meal_database } = require('../utils/database');
const logger = require('../utils/utils').logger;
let index = database.users.length;

// userController handles the routes for creating, updating, deleting, and retrieving user data
const userController = {
  // CreateUser creates a new user and adds it to the database
  CreateUser: (req, res) => {
    // Get the user information from the request body
    const user = req.body;
    logger.debug('user = ', user);

    // Validate the user information using assertions
    try {
      assert(typeof user.firstname === 'string', 'firstName must be a string');
      assert(typeof user.lastname === 'string', 'lastName must be a string');
      assert(typeof user.street === 'string', 'street must be a string');
      assert(typeof user.city === 'string', 'city must be a string');
      assert(
        typeof user.emailaddress === 'string',
        'emailAddress must be a string'
      );
      assert(typeof user.password === 'string', 'password must be a string');
      assert(
        typeof user.phonenumber === 'string',
        'phoneNumber must be a string'
      );

      if (!fun.validateEmail(user.emailaddress)) {
        throw new Error('Ongeldig e-mailadres');
      }

      if (!fun.validatePassword(user.password)) {
        throw new Error(
          'Ongeldig wachtwoord. Het wachtwoord moet minstens 8 tekens lang zijn, een hoofdletter, een kleine letter, een cijfer en een speciaal teken bevatten.'
        );
      }

      if (!fun.validatePhoneNumber(user.phonenumber)) {
        throw new Error(
          'Ongeldig telefoonnummer. Het telefoonnummer moet 10 cijfers lang zijn.'
        );
      }
    } catch (err) {
      // If any assertion fails, log the error message and return a 400 Bad Request response
      logger.warn(err.message.toString());
      res.status(400).json({
        status: 400,
        message: err.message.toString(),
        data: {},
      });
      return;
    }
    // Check if a user with the same email address already exists
    const emailExists = database.users.some(
      (existingUser) => existingUser.emailaddress === user.emailaddress
    );

    // If the email already exists, return a 400 Bad Request response
    if (emailExists) {
      return res.status(400).json({
        status: 400,
        message: 'Een gebruiker met dit e-mailadres bestaat al',
        data: {},
      });
    }

    // Assign a new ID to the user and add it to the database
    user.id = index++;
    database.users.push(user);
    logger.info(`New user with ID ${user.id} added to the database.`);

    // Send the response with the user data and a success message
    res.status(200).json({
      status: 200,
      message: `Gebruiker met id ${user.id} is geregistreerd`,
      data: user,
    });
  },
  // getAllUsers retrieves all users from the database
  getAllUsers: (req, res) => {
    // Log that the function is called to get all users
    logger.info('Get all users');
    // Set the response status to 200 OK
    res.status(200);
    // Send a single response containing all the user data
    res.json({
      status: 200,
      message: 'server info-endpoint',
      data: database.users,
    });
  },
  // deleteUser deletes a user from the database based on their email and password
  deleteUser: (req, res) => {
    try {
      const { emailaddress, password } = req.body;
      // Log the request body for debugging purposes
      logger.debug(req.body);
      // Find the index of the user with the given email address
      const userIndex = database.users.findIndex(
        (user) => user.emailaddress === emailaddress
      );
      // If the user is not found, throw an error
      if (userIndex === -1) {
        throw new Error('Gebruiker niet gevonden');
      }

      const user = database.users[userIndex];

      // If the given password does not match the user's password, throw an error
      if (user.password !== password) {
        throw new Error('Ongeldig wachtwoord');
      }

      // Remove the user from the database
      database.users.splice(userIndex, 1);

      // Log that the user has been successfully deleted
      logger.info(
        `User with email ${emailaddress} has been successfully deleted.`
      );
      // Send a success response
      res.status(200).json({
        status: 200,
        message: 'Gebruiker is met succes verwijderd',
        data: {},
      });
    } catch (err) {
      // Log the error message
      logger.warn(err.message.toString());
      // Determine the appropriate status code for the error
      let statusCode = 400;
      if (err.message === 'Gebruiker niet gevonden') {
        statusCode = 404;
      } else if (err.message === 'Ongeldig wachtwoord') {
        statusCode = 401;
      }
      // Send an error response with the appropriate status code
      res.status(statusCode).json({
        status: statusCode,
        message: err.message.toString(),
        data: {},
      });
    }
  },
  // updateUser updates a user's information in the database based on their email and password
  updateUser: (req, res) => {
    try {
      const { emailaddress, password, updateData } = req.body;
      // Find the index of the user with the given email address
      const userIndex = database.users.findIndex(
        (user) => user.emailaddress === emailaddress
      );
      // If the user is not found, throw an error
      if (userIndex === -1) {
        throw new Error('Gebruiker niet gevonden');
      }

      const user = database.users[userIndex];
      // If the given password does not match the user's password, throw an error
      if (user.password !== password) {
        throw new Error('Ongeldig wachtwoord');
      }

      const { firstname, lastname, street, city, newPassword, phonenumber } =
        updateData;
      // Validate the update data and throw an error if any field is invalid
      if (firstname && !firstname.trim()) {
        throw new Error('Voornaam is verplicht');
      }

      if (lastname && !lastname.trim()) {
        throw new Error('Achternaam is verplicht');
      }

      if (street && !street.trim()) {
        throw new Error('Straat is verplicht');
      }

      if (city && !city.trim()) {
        throw new Error('Stad is verplicht');
      }

      if (newPassword && !fun.validatePassword(newPassword)) {
        throw new Error(
          'Ongeldig wachtwoord. Het wachtwoord moet minstens 8 tekens lang zijn, een hoofdletter, een kleine letter, een cijfer en een speciaal teken bevatten.'
        );
      }

      if (phonenumber && !fun.validatePhoneNumber(phonenumber)) {
        throw new Error(
          'Ongeldig telefoonnummer. Het telefoonnummer moet 10 cijfers lang zijn.'
        );
      }

      // Update the user's information with the provided updateData
      if (firstname) user.firstname = firstname;
      if (lastname) user.lastname = lastname;
      if (street) user.street = street;
      if (city) user.city = city;
      if (newPassword) user.password = newPassword;
      if (phonenumber) user.phonenumber = phonenumber;

      // Save the updated user in the database
      database.users[userIndex] = user;
      // Log that the user has been successfully updated
      logger.info(
        `User with ID ${user.id} has been successfully updated in the database.`
      );
      // Send a success response
      res.status(200).json({
        status: 200,
        message: 'Gebruiker is met succes bijgewerkt',
        data: user,
      });
    } catch (err) {
      // Log the error message
      logger.warn(err.message.toString());
      // Determine the appropriate status code for the error
      let statusCode = 400;
      if (err.message === 'Gebruiker niet gevonden') {
        statusCode = 404;
      } else if (err.message === 'Ongeldig wachtwoord') {
        statusCode = 401;
      }
      // Send an error response with the appropriate status code
      res.status(statusCode).json({
        status: statusCode,
        message: err.message.toString(),
        data: {},
      });
    }
  },
  // getUserProfile retrieves a user's profile information based on their email and password
  getUserProfile: (req, res) => {
    try {
      const { emailaddress, password } = req.body;
      console.log(req.body);
      // Check if emailaddress and password are strings, otherwise throw an error    // Check if emailaddress and password are strings, otherwise throw an error
      assert(typeof emailaddress === 'string', 'emailAddress must be a string');
      assert(typeof password === 'string', 'password must be a string');
      // Find the index of the user with the given email address
      const userIndex = database.users.findIndex(
        (user) => user.emailaddress === emailaddress
      );
      // If the user is not found, throw an error
      if (userIndex === -1) {
        throw new Error('Gebruiker niet gevonden');
      }

      const user = database.users[userIndex];
      // If the given password does not match the user's password, throw an error
      if (user.password !== password) {
        throw new Error('Ongeldig wachtwoord');
      }
      // Create an object containing the user's profile details
      const userDetails = {
        firstname: user.firstname,
        lastname: user.lastname,
        emailaddress: user.emailaddress,
        password: user.password,
        street: user.street,
        city: user.city,
        phonenumber: user.phonenumber,
        meals: user.meals,
      };
      // Log that the user's profile has been successfully fetched
      logger.info(
        `User with email ${user.emailaddress} has been successfully fetched.`
      );
      // Send a success response with the user's profile details
      res.status(200).json({
        status: 200,
        message: 'Profielgegevens opgehaald',
        data: userDetails,
      });
    } catch (err) {
      // Log the error message
      logger.warn(err.message.toString());
      // Determine the appropriate status code for the error
      let statusCode = 400;
      if (err.message === 'Gebruiker niet gevonden') {
        statusCode = 404;
      } else if (err.message === 'Ongeldig wachtwoord') {
        statusCode = 401;
      }
      // Send an error response with the appropriate status code
      res.status(statusCode).json({
        status: statusCode,
        message: err.message.toString(),
        data: {},
      });
    }
  },
  // getUserById retrieves a user's public information and associated meals based on their user ID
  getUserById: (req, res) => {
    try {
      // Parse the user ID from the request parameters
      const userId = parseInt(req.params.id);
      // Check if the user ID is valid, otherwise throw an erro
      if (isNaN(userId)) {
        throw new Error('Ongeldig gebruikers-ID');
      }
      // Find the user with the given user ID
      const user = database.users.find((user) => user.id === userId);
      // If the user is not found, throw an error
      if (!user) {
        throw new Error('Gebruiker niet gevonden');
      }

      // Find meals where the user is the cook
      const meals = meal_database.meals.filter(
        (meal) => meal.cook.id === userId
      );
      // Create an object containing the user's public details and associated meals
      const userDetails = {
        firstname: user.firstname,
        lastname: user.lastname,
        emailaddress: user.emailaddress,
        phonenumber: user.phonenumber,
        meals: meals,
      };
      // Create a message based on whether the user has any associated meals
      const message =
        meals && meals.length > 0
          ? 'Gebruikersgegevens en maaltijden opgehaald'
          : 'Gebruikersgegevens opgehaald, maar deze gebruiker heeft geen maaltijden';

      // Log that the user has been successfully fetched
      logger.info(`User with ID ${user.id} has been successfully fetched.`);

      // Send a success response with the user's details and associated meals
      res
        .status(200)
        .json({ status: 200, message: message, data: userDetails });
    } catch (err) {
      // Log the error message
      logger.warn(err.message.toString());

      // Determine the appropriate status code for the error
      let statusCode = 400;
      if (err.message === 'Gebruiker niet gevonden') {
        statusCode = 404;
      }
      // Send an error response with the appropriate status code
      res.status(statusCode).json({
        status: statusCode,
        message: err.message.toString(),
        data: {},
      });
    }
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
