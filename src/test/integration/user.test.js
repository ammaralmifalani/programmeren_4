const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../../index');
const dbconnection = require('../../database/dbconnection');
const { getTableLength } = require('../../controller/userController');
const { logger, jwtSecretKey } = require('../utils/utils');
const jwt = require('jsonwebtoken');
require('tracer').setLevel('debug');
chai.should();
chai.use(chaiHttp);

/**
 * Db queries to clear and fill the test database before each test.
 *
 * LET OP: om via de mysql2 package meerdere queries in één keer uit te kunnen voeren,
 * moet je de optie 'multipleStatements: true' in de database config hebben staan.
 */
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB =
  CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;
const emailAdress_test = 'a.name@server.nl';
const password_test = 'Abcd@123';
/**
 * Voeg een user toe aan de database. Deze user heeft id 1.
 * Deze id kun je als foreign key gebruiken in de andere queries, bv insert meal.
 */
const INSERT_USER =
  'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
  '(1, "first", "last", "a.name@server.nl", "Abcd@123", "street", "city")';

/**
 * Query om twee meals toe te voegen. Let op de cookId, die moet matchen
 * met een bestaande user in de database.
 */
const INSERT_MEALS =
  'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
  "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
  "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 2);";
// A global variable to keep the connection
let connection;
function setupDatabase(done) {
  connection = dbconnection.getConnection(function (err, conn) {
    if (err) throw err; // not connected!
    connection = conn;
    // Run your CLEAR_DB and INSERT_USER SQL commands here
    connection.query(CLEAR_DB + INSERT_USER, function (err) {
      if (err) throw err;
      done(); // Signal that the setup is complete.
    });
  });
}
function cleanupDatabase(done) {
  connection.query(CLEAR_DB, function (err) {
    if (err) throw err;
    // Close the connection
    connection.end();
    done(); // Signal that cleanup is complete.
  });
}
// Test case UC-201.
describe('User Registration', function () {
  beforeEach(setupDatabase);
  afterEach(cleanupDatabase);
  it('TC-201-1 should return an error if any field is missing', (done) => {
    const newUser = {
      firstName: 'testFirstName',
      // lastName: 'testLastName',
      emailAdress: 'a.testEmail@test.com',
      password: 'Test@123',
      phoneNumber: '0612345678',
      street: 'Main Street 123',
      city: 'Amsterdam',
    };
    chai
      .request(app)
      .post('/api/user/register')
      .send(newUser)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(400);
        let { data, message, status } = res.body;
        message.should.be.equal('Required fields missing');
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });
  it('TC-201-1.1 should return an error if any field is empty', (done) => {
    const newUser = {
      firstName: 'testFirstName',
      lastName: '',
      emailAdress: 'a.testEmail@test.com',
      password: 'Test@123',
      phoneNumber: '0612345678',
      street: 'Main Street 123',
      city: 'Amsterdam',
    };
    chai
      .request(app)
      .post('/api/user/register')
      .send(newUser)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(400);
        let { data, message, status } = res.body;
        message.should.be.equal('Required fields missing');
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });
  it('TC-201-1.2 should return an error if any field type is incorrect', (done) => {
    const newUser = {
      firstName: 'testFirstName',
      lastName: 1,
      emailAdress: 'a.testEmail@test.com',
      password: 'Test@123',
      phoneNumber: '0612345678',
      street: 'Main Street 123',
      city: 'Amsterdam',
    };
    chai
      .request(app)
      .post('/api/user/register')
      .send(newUser)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(400);
        let { data, message, status } = res.body;
        message.should.be.equal(
          'Invalid field type: lastName should be of type string, but it is of type number.'
        );
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });
  it('TC-201-2 should return an error if email address is invalid', (done) => {
    const newUser = {
      firstName: 'testFirstName',
      lastName: 'testLastName',
      emailAdress: 'a.testEmailtest.com',
      password: 'Test@123',
      phoneNumber: '0612345678',
      street: 'Main Street 123',
      city: 'Amsterdam',
    };
    chai
      .request(app)
      .post('/api/user/register')
      .send(newUser)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(400);
        let { data, message, status } = res.body;
        message.should.be.equal('Invalid email address');
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });
  it('TC-201-3 should return an error if password is invalid', (done) => {
    const newUser = {
      firstName: 'testFirstName',
      lastName: 'testLastName',
      emailAdress: 'a.testEmail@test.com',
      password: 'Test23',
      phoneNumber: '0612345678',
      street: 'Main Street 123',
      city: 'Amsterdam',
    };
    chai
      .request(app)
      .post('/api/user/register')
      .send(newUser)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(400);
        let { data, message, status } = res.body;
        message.should.be.equal(
          'Invalid password. The password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number and a special character.'
        );
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });
  it('TC-201-4 should return an error if email exists', (done) => {
    const newUser = {
      firstName: 'testFirstName',
      lastName: 'testLastName',
      emailAdress: 'a.name@server.nl',
      password: 'Test@1123',
      phoneNumber: '0612345678',
      street: 'Main Street 123',
      city: 'Amsterdam',
    };
    chai
      .request(app)
      .post('/api/user/register')
      .send(newUser)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(409);
        let { data, message, status } = res.body;
        message.should.be.equal(
          'A user already exists with this email address.'
        );
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });
  it('TC-201-5 should register a new user successfully', (done) => {
    const newUser = {
      firstName: 'testFirstName',
      lastName: 'testLastName',
      emailAdress: 'a.testEmail@test.com',
      password: 'Test@123',
      phoneNumber: '0612345678',
      street: 'Main Street 123',
      city: 'Amsterdam',
    };
    chai
      .request(app)
      .post('/api/user/register')
      .send(newUser)
      .end((err, res) => {
        assert(err === null);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(201);
        res.body.should.have.property('message').to.be.a('string');
        res.body.should.have.property('data').to.be.an('object');

        let { data, message, status } = res.body;

        message.should.be.equal(
          `User with email address ${newUser.emailAdress} is registered`
        );

        data.should.have.property('firstName').to.be.equal(newUser.firstName);
        data.should.have.property('lastName').to.be.equal(newUser.lastName);
        data.should.have.property('street').to.be.equal(newUser.street);
        data.should.have.property('city').to.be.equal(newUser.city);
        data.should.have
          .property('emailAdress')
          .to.be.equal(newUser.emailAdress);
        data.should.have.property('password').to.be.equal(newUser.password);
        data.should.have
          .property('phoneNumber')
          .to.be.equal(newUser.phoneNumber);
        done();
      });
  });
  it.skip('TC-201- should return an error if phoneNumber is invalid', (done) => {
    const newUser = {
      firstName: 'testFirstName',
      lastName: 'testLastName',
      emailAdress: 'a.testEmail@test.com',
      password: 'Test@123',
      phoneNumber: '061345678',
      street: 'Main Street 123',
      city: 'Amsterdam',
    };
    chai
      .request(app)
      .post('/api/user/register')
      .send(newUser)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(400);
        let { data, message, status } = res.body;
        message.should.be.equal(
          'Invalid phone number. Phone number must be 10 digits long.'
        );
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });
});
// Test case UC-202
describe('Get All Users', function () {
  beforeEach(setupDatabase);
  afterEach(cleanupDatabase);
  it('TC-202-1 should return all users in the database', (done) => {
    chai
      .request(app)
      .get('/api/user')
      .end((err, res) => {
        assert(err === null);

        // Get the expected length of the user table
        getTableLength('user', (tableErr, tableLength) => {
          if (tableErr) {
            logger.error(tableErr);
          }
          res.body.should.be.an('object');
          res.body.should.have.property('status').to.be.equal(200);
          res.body.should.have.property('message');
          res.body.should.have.property('data');
          let { data, message, status } = res.body;
          data.should.be.an('array');
          message.should.be.equal('User getAll endpoint');
          data.length.should.be.equal(tableLength);
          done();
        });
      });
  });
});
// Test case UC-203 User Profile'
describe('User Profile', function () {
  beforeEach(setupDatabase);
  afterEach(cleanupDatabase);
  it('TC-203-1 should return user profile data', (done) => {
    const credentials = { emailAdress: 'a.name@server.nl' };
    chai
      .request(app)
      .post('/api/user/profile')
      .send(credentials)
      .end((err, res) => {
        assert(err === null);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(200);
        res.body.should.have.property('message');
        res.body.should.have.property('data');
        let { data, message, status } = res.body;
        const user = {
          firstName: 'first',
          lastName: 'last',
          emailAdress: credentials.emailAdress,
          password: password_test,
          isActive: 1,
          phoneNumber: '0612345678',
          roles: 'editor,guest',
          street: 'street',
          city: 'city',
        };
        data.should.be.an('object');
        message.should.be.equal('Profile data retrieved');
        data.should.have.property('firstName').to.be.equal(user.firstName);
        data.should.have.property('lastName').to.be.equal(user.lastName);
        data.should.have.property('emailAdress').to.be.equal(user.emailAdress);
        data.should.have.property('password').to.be.equal(user.password);
        data.should.have.property('street').to.be.equal(user.street);
        data.should.have.property('city').to.be.equal(user.city);
        done();
      });
  });
  it('TC-203-2 should return error if user not found', (done) => {
    const credentials = { emailAdress: 'a.nonexistentuser@example.com' };

    chai
      .request(app)
      .post('/api/user/profile')
      .send(credentials)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(404);
        let { data, message, status } = res.body;
        message.should.be.equal('User not found');
        Object.keys(data).length.should.be.equal(0);
        done();
      });
  });
});
// Test case UC-204 Get User by ID
describe('Get User by ID', function () {
  beforeEach(setupDatabase);
  afterEach(cleanupDatabase);

  it('UC-204-3 should return user details and meals', (done) => {
    const userId = 1; // Change this to the appropriate user ID in the database
    chai
      .request(app)
      .get(`/api/user/${userId}`)
      .end((err, res) => {
        assert(err === null);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(200);
        res.body.should.have.property('message');
        res.body.should.have.property('data');
        let { data, message, status } = res.body;
        message.should.be.equal('User found');
        data.should.have.property('firstName');
        data.should.have.property('lastName');
        data.should.have.property('emailAdress');
        data.should.have.property('phoneNumber');
        data.should.have.property('meals');
        done();
      });
  });

  it.skip('UC-204- should return error for invalid user ID', (done) => {
    const userId = 'invalid';
    chai
      .request(app)
      .get(`/api/user/${userId}`)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(400);
        let { data, message, status } = res.body;
        message.should.be.equal('Invalid user ID');
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });

  it('UC-204-2 should return error for user not found', (done) => {
    const userId = 9999999;
    chai
      .request(app)
      .get(`/api/user/${userId}`)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(404);
        let { data, message, status } = res.body;
        message.should.be.equal('User not found');
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });
});
// Test case UC-205 Update User
describe('Update User', function () {
  beforeEach(setupDatabase);
  afterEach(cleanupDatabase);
  // User updated successfully
  it('TC-205-6 should update user data', (done) => {
    const requestData = {
      emailAdress: 'a.name@server.nl',
      updateData: {
        firstName: 'testFirstName',
        lastName: 'testLastName',
        isActive: 1,
        emailAdress: 'testEmail@test.com',
        newPassword: 'Test@123',
        phoneNumber: '0612345678',
        roles: 'editor,guest',
        street: 'Main Street 123',
        city: 'Amsterdam',
      },
    };

    chai
      .request(app)
      .put('/api/user/update')
      .send(requestData)
      .end((err, res) => {
        assert(err === null);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(200);
        res.body.should.have.property('message');
        res.body.should.have.property('data');
        let { data, message, status } = res.body;
        message.should.be.equal('User information updated successfully');
        data.should.be.an('object');
        data.should.have
          .property('firstName')
          .to.be.equal(requestData.updateData.firstName);
        data.should.have
          .property('lastName')
          .to.be.equal(requestData.updateData.lastName);
        data.should.have
          .property('street')
          .to.be.equal(requestData.updateData.street);
        data.should.have
          .property('city')
          .to.be.equal(requestData.updateData.city);
        data.should.have
          .property('password')
          .to.be.equal(requestData.updateData.newPassword);
        data.should.have
          .property('phoneNumber')
          .to.be.equal(requestData.updateData.phoneNumber);
        data.should.have
          .property('isActive')
          .to.be.equal(requestData.updateData.isActive);
        data.should.have
          .property('roles')
          .to.be.equal(requestData.updateData.roles);
        done();
      });
  });
  // User is not found
  it('TC-205-1 should return error if user not found', (done) => {
    const requestData = {
      emailAdress: 'nonexistentuser@example.com',
      updateData: {
        firstName: 'UpdatedAmmar',
      },
    };

    chai
      .request(app)
      .put('/api/user/update')
      .send(requestData)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(404);
        let { data, message, status } = res.body;
        message.should.be.equal('User is not found');
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });
  // Invalid firstName test
  it('TC-205- should return error if firstName is not a string', (done) => {
    const requestData = {
      emailAdress: 'a.name@server.nl',
      updateData: {
        firstName: 123,
      },
    };
    chai
      .request(app)
      .put('/api/user/update')
      .send(requestData)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(400);
        let { data, message, status } = res.body;
        message.should.be.equal('first name should be text.');
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });
  // Invalid lastName test
  it('TC-205- should return error if lastName is not a string', (done) => {
    const requestData = {
      emailAdress: 'a.name@server.nl',
      updateData: {
        lastName: 456,
      },
    };
    chai
      .request(app)
      .put('/api/user/update')
      .send(requestData)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(400);
        let { data, message, status } = res.body;
        message.should.be.equal('Last name should be a text.');
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });
  // Invalid street test
  it('TC-205- should return error if street is not a string', (done) => {
    const requestData = {
      emailAdress: 'a.name@server.nl',
      updateData: {
        street: 789,
      },
    };
    chai
      .request(app)
      .put('/api/user/update')
      .send(requestData)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(400);
        let { data, message, status } = res.body;
        message.should.be.equal('Street should be a text.');
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });
  // Invalid city test
  it('TC-205- should return error if city is not a string', (done) => {
    const requestData = {
      emailAdress: 'a.name@server.nl',
      updateData: {
        city: 101112,
      },
    };
    chai
      .request(app)
      .put('/api/user/update')
      .send(requestData)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(400);
        let { data, message, status } = res.body;
        message.should.be.equal('City should be a text.');
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });
  // Invalid phoneNumber test
  it('TC-205-3 should return error if phoneNumber is invalid', (done) => {
    const requestData = {
      emailAdress: 'a.name@server.nl',
      updateData: {
        phoneNumber: '123456789',
      },
    };
    chai
      .request(app)
      .put('/api/user/update')
      .send(requestData)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(400);
        let { data, message, status } = res.body;
        message.should.be.equal(
          'Invalid phone number. Phone number must be 10 digits long.'
        );
        Object.keys(data).length.should.be.equal(0);
        done();
      });
  });
  // Invalid newPassword test
  it('TC-205- should return error if newPassword is invalid', (done) => {
    const requestData = {
      emailAdress: 'a.name@server.nl',
      updateData: {
        newPassword: 'invalidpassword',
      },
    };
    chai
      .request(app)
      .put('/api/user/update')
      .send(requestData)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(400);
        let { data, message, status } = res.body;
        message.should.be.equal(
          'Invalid password. The password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number and a special character.'
        );
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });
});
// Test case UC-206 Delete User
describe('Delete User', function () {
  beforeEach(setupDatabase);
  afterEach(cleanupDatabase);
  it('TC-206-4 should delete user', (done) => {
    const credentials = { emailAdress: 'a.name@server.nl' };
    chai
      .request(app)
      .delete('/api/user/delete')
      .send(credentials)
      .end((err, res) => {
        logger.debug('Response body:', res.body);
        assert(err === null);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(200);
        let { data, message, status } = res.body;
        message.should.be.equal('User deleted successfully');
        Object.keys(data).length.should.be.equal(10);
        done();
      });
  });
  it('TC-206-1 should return error if user not found', (done) => {
    const credentials = { emailAdress: 'nonexistentuser@test.com' };
    chai
      .request(app)
      .delete('/api/user/delete')
      .send(credentials)
      .end((err, res) => {
        logger.debug('Response body:', res.body);
        assert(err === null);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(404);
        let { data, message, status } = res.body;
        message.should.be.equal('user not found');
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });
});
describe('UC-101 Inloggen', () => {
  beforeEach(setupDatabase);
  afterEach(cleanupDatabase);
  it('TC-101-1 Verplicht veld ontbreekt', (done) => {
    const credentials = {
      emailAdress: emailAdress_test,
      // password: password_test,
    };
    chai
      .request(app)
      .post('/api/user/login')
      .send(credentials)
      .end((err, res) => {
        if (err) {
          console.error(err);
          return done(err);
        }
        logger.debug('Response:', res.body);
        res.should.have.status(400);
        res.body.should.have.property('message');
        let { data, message, status } = res.body;
        Object.keys(data).length.should.be.equal(0);
        done();
      });
  });

  it('TC-101-2 Niet-valide wachtwoord', (done) => {
    // You would need to know an existing email
    const credentials = {
      emailAdress: emailAdress_test,
      password: 'invalidPassword',
    };
    chai
      .request(app)
      .post('/api/user/login')
      .send(credentials)
      .end((err, res) => {
        if (err) {
          console.error(err);
          return done(err);
        }
        logger.debug('Response:', res.body);
        res.should.have.status(401);
        done();
      });
  });

  it('TC-101-3 Gebruiker bestaat niet', (done) => {
    const credentials = {
      emailAdress: 'nonexisting@example.com',
      password: 'password',
    };
    chai
      .request(app)
      .post('/api/user/login')
      .send(credentials)
      .end((err, res) => {
        if (err) {
          console.error(err);
          return done(err);
        }
        logger.debug('Response:', res.body);
        res.should.have.status(404);
        done();
      });
  });

  it('TC-101-4 Gebruiker succesvol ingelogd', (done) => {
    // You would need to know an existing email and password
    const credentials = {
      emailAdress: emailAdress_test,
      password: password_test,
    };
    chai
      .request(app)
      .post('/api/user/login')
      .send(credentials)
      .end((err, res) => {
        if (err) {
          console.error(err);
          return done(err);
        }
        logger.debug('Response:', res.body);
        res.should.have.status(200);
        res.body.should.have.property('message');
        res.body.data.should.have.property('token');
        jwt.verify(res.body.data.token, jwtSecretKey, (err, payload) => {
          assert.equal(err, null);
          assert.equal(payload.userId, 1);
          done();
        });
      });
  });
});
