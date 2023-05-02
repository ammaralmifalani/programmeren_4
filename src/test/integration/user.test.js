const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../../index');
// const { database, meal_database } = require('../../database/inmemdb');
const database = require('../../database/dbconnection');
const { getTableLength } = require('../../controller/userController');
const userController = require('../../controller/userController');
// let index = database.users.length;
const logger = require('../utils/utils').logger;
const fun = require('../../controller/function');
require('tracer').setLevel('debug');
chai.should();
chai.use(chaiHttp);

// function to not store the data in the database but delete it immediately after execution, i.e. only for testing purposes
function createTestUser(done) {
  const testUser = {
    firstName: 'testFirstName',
    lastName: 'testLastName',
    isActive: 1,
    emailAdress: 'testEmail@test.com',
    password: 'Test@123',
    phoneNumber: '0612345678',
    roles: '',
    street: 'Main Street 123',
    city: 'Amsterdam',
  };

  chai
    .request(app)
    .post('/api/user/register')
    .send(testUser)
    .end((err, res) => {
      logger.debug('Create test user response body:', res.body);
      logger.debug('Create test user error:', err);
      done();
    });
}
function deleteTestUser(done) {
  const credentials = {
    emailAdress: 'testEmail@test.com',
    password: 'Test@123',
  };

  chai
    .request(app)
    .delete('/api/user/delete')
    .send(credentials)
    .end((err, res) => {
      logger.debug('Delete test user response body:', res.body);
      logger.debug('Delete test user error:', err);
      done();
    });
}
// Test case UC-201.
describe('Register User', function () {
  afterEach(function (done) {
    deleteTestUser(done);
  });
  it('TC-201-1 should register a new user successfully', (done) => {
    const newUser = {
      firstName: 'testFirstName',
      lastName: 'testLastName',
      isActive: 1,
      emailAdress: 'testEmail@test.com',
      password: 'Test@123',
      phoneNumber: '0612345678',
      roles: '',
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
          `Gebruiker met e-mailadres ${newUser.emailAdress} is geregistreerd`
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

  it('TC-201-2 should return an error if email address is invalid', (done) => {
    const newUser = {
      firstName: 'testFirstName',
      lastName: 'testLastName',
      isActive: 1,
      emailAdress: 'testEmailtest.com',
      password: 'Test@123',
      phoneNumber: '0612345678',
      roles: '',
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
        message.should.be.equal('Ongeldig e-mailadres');
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });

  it('TC-201-3 should return an error if phonenumber is invalid', (done) => {
    const newUser = {
      firstName: 'testFirstName',
      lastName: 'testLastName',
      isActive: 1,
      emailAdress: 'testEmail@test.com',
      password: 'Test@123',
      phoneNumber: '061345678',
      roles: '',
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
          'Ongeldig telefoonnummer. Het telefoonnummer moet 10 cijfers lang zijn.'
        );
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });

  it('TC-201-4 should return an error if password is invalid', (done) => {
    const newUser = {
      firstName: 'testFirstName',
      lastName: 'testLastName',
      isActive: 1,
      emailAdress: 'testEmail@test.com',
      password: 'Test23',
      phoneNumber: '0612345678',
      roles: '',
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
          'Ongeldig wachtwoord. Het wachtwoord moet minstens 8 tekens lang zijn, een hoofdletter, een kleine letter, een cijfer en een speciaal teken bevatten.'
        );
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });

  it('TC-201-5 should return an error if any field is empty', (done) => {
    const newUser = {
      firstName: 'testFirstName',
      lastName: '',
      isActive: 1,
      emailAdress: 'testEmail@test.com',
      password: 'Test@123',
      phoneNumber: '0612345678',
      roles: '',
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
        message.should.be.equal('Vereiste velden ontbreken');
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });

  it('TC-201-6 should return an error if any field is missing', (done) => {
    const newUser = {
      firstName: 'testFirstName',
      // lastName: 'testLastName',
      isActive: 1,
      emailAdress: 'testEmail@test.com',
      password: 'Test@123',
      phoneNumber: '0612345678',
      roles: '',
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
        message.should.be.equal('Vereiste velden ontbreken');
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });

  it('TC-201-7 should return an error if any field type is incorrect', (done) => {
    const newUser = {
      firstName: 'testFirstName',
      lastName: 1,
      isActive: 1,
      emailAdress: 'testEmail@test.com',
      password: 'Test@123',
      phoneNumber: '0612345678',
      roles: '',
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
          'Ongeldig veldtype: lastName moet van het type string zijn, maar het is van het type number.'
        );
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });

  it('TC-201-8 should register a new user successfully with an empty phoneNumber', (done) => {
    const newUser = {
      firstName: 'testFirstName',
      lastName: 'testLastName',
      isActive: 1,
      emailAdress: 'testEmail@test.com',
      password: 'Test@123',
      phoneNumber: '',
      roles: '',
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
          `Gebruiker met e-mailadres ${newUser.emailAdress} is geregistreerd`
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
});
// Test case UC-202
describe('Get All Users', function () {
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
// Test case UC-203
describe('Get User Profile', function () {
  it('TC-203-1 should return user profile data', (done) => {
    const credentials = {
      emailAdress: 'john.doe@example.com',
      password: 'Abcd@123',
    };
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
          firstName: 'John',
          lastName: 'Doe',
          emailAdress: credentials.emailAdress,
          password: credentials.password,
          street: 'Main Street 123',
          city: 'Amsterdam',
        };
        data.should.be.an('object');
        message.should.be.equal('Profielgegevens opgehaald');
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
    const credentials = {
      emailAdress: 'nonexistentuser@example.com',
      password: 'P@ssw0rd!',
    };
    chai
      .request(app)
      .post('/api/user/profile')
      .send(credentials)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(404);
        let { data, message, status } = res.body;
        message.should.be.equal('Gebruiker niet gevonden');
        Object.keys(data).length.should.be.equal(0);
        done();
      });
  });

  it('TC-203-3 should return error if password is incorrect', (done) => {
    const credentials = {
      emailAdress: 'john.doe@example.com',
      password: 'IncorrectPassword!',
    };
    chai
      .request(app)
      .post('/api/user/profile')
      .send(credentials)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(401);
        let { data, message, status } = res.body;
        message.should.be.equal('Ongeldig wachtwoord');
        Object.keys(data).length.should.be.equal(0);
        done();
      });
  });
});
// Test case UC-204
describe('Get User by ID', function () {
  it('UC-204-1 should return user details and meals', (done) => {
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
        message.should.be.equal('Gebruiker gevonden');
        data.should.have.property('firstName');
        data.should.have.property('lastName');
        data.should.have.property('emailAdress');
        data.should.have.property('phoneNumber');
        data.should.have.property('meals');
        done();
      });
  });

  it('UC-204-2 should return error for invalid user ID', (done) => {
    const userId = 'invalid';
    chai
      .request(app)
      .get(`/api/user/${userId}`)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(400);
        let { data, message, status } = res.body;
        message.should.be.equal('Ongeldige gebruikers-ID');
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });

  it('UC-204-3 should return error for user not found', (done) => {
    const userId = 9999999;
    chai
      .request(app)
      .get(`/api/user/${userId}`)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(404);
        let { data, message, status } = res.body;
        message.should.be.equal('Gebruiker niet gevonden');
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });
});
// Test case  UC-205
describe('Update User', function () {
  // User updated successfully
  it('TC-205-1 should update user data', (done) => {
    const requestData = {
      emailAdress: 'john.doe@example.com',
      password: 'Abcd@123',
      updateData: {
        firstName: 'John',
        lastName: 'Doe',
        street: 'Main Street 123',
        city: 'Amsterdam',
        newPassword: 'Abcd@123',
        phoneNumber: '0698765432',
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
        done();
      });
  });
  // User is not found
  it('TC-205-2 should return error if user not found', (done) => {
    const requestData = {
      emailAdress: 'nonexistentuser@example.com',
      password: 'NewP@ssw0rd!',
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
  // Invalid password
  it('TC-205-3 should return error if password is incorrect', (done) => {
    const requestData = {
      emailAdress: 'john.doe@example.com',
      password: 'IncorrectPassword!',
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
        res.body.should.have.property('status').to.be.equal(401);
        let { data, message, status } = res.body;
        message.should.be.equal('Invalid password');
        Object.keys(data).length.should.be.equal(0);
        done();
      });
  });
  // Invalid firstName test
  it('TC-205-4 should return error if firstName is not a string', (done) => {
    const requestData = {
      emailAdress: 'john.doe@example.com',
      password: 'Abcd@123',
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
  it('TC-205-5 should return error if lastName is not a string', (done) => {
    const requestData = {
      emailAdress: 'john.doe@example.com',
      password: 'Abcd@123',
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
  it('TC-205-6 should return error if street is not a string', (done) => {
    const requestData = {
      emailAdress: 'john.doe@example.com',
      password: 'Abcd@123',
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
  it('TC-205-7 should return error if city is not a string', (done) => {
    const requestData = {
      emailAdress: 'john.doe@example.com',
      password: 'Abcd@123',
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
  it('TC-205-8 should return error if phoneNumber is invalid', (done) => {
    const requestData = {
      emailAdress: 'john.doe@example.com',
      password: 'Abcd@123',
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
  it('TC-205-9 should return error if newPassword is invalid', (done) => {
    const requestData = {
      emailAdress: 'john.doe@example.com',
      password: 'Abcd@123',
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

  // Update phoneNumber to empty
  it('TC-205-10 should update phoneNumber to empty', (done) => {
    const requestData = {
      emailAdress: 'john.doe@example.com',
      password: 'Abcd@123',
      updateData: {
        phoneNumber: '',
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
        data.should.have.property('phoneNumber').to.be.equal('');

        done();
      });
  });
});
// Test case UC-206
describe('Delete User', function () {
  beforeEach(function (done) {
    createTestUser(done);
  });
  afterEach(function (done) {
    deleteTestUser(done);
  });
  it('TC-206-1 should delete user', (done) => {
    const credentials = {
      emailAdress: 'testEmail@test.com',
      password: 'Test@123',
    };
    chai
      .request(app)
      .delete('/api/user/delete')
      .send(credentials)
      .end((err, res) => {
        console.log('Response body:', res.body);
        assert(err === null);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(200);
        let { data, message, status } = res.body;
        message.should.be.equal('User deleted successfully');
        Object.keys(data).length.should.be.equal(10);
        done();
      });
  });
  it('TC-206-2 should return error if user not found', (done) => {
    const credentials = {
      emailAdress: 'nonexistentuser@test.com',
      password: 'Test@123',
    };
    chai
      .request(app)
      .delete('/api/user/delete')
      .send(credentials)
      .end((err, res) => {
        console.log('Response body:', res.body);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(401);
        let { data, message, status } = res.body;
        message.should.be.equal('Email address is incorrect');
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });
  it('TC-206-3 should return error if password is incorrect', (done) => {
    const credentials = {
      emailAdress: 'testEmail@test.com',
      password: 'IncorrectPassword123!',
    };
    chai
      .request(app)
      .delete('/api/user/delete')
      .send(credentials)
      .end((err, res) => {
        console.log('Response body:', res.body);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(401);
        let { data, message, status } = res.body;
        message.should.be.equal('Password is incorrect');
        Object.keys(data).length.should.be.equal(0);
        done();
      });
  });
});
