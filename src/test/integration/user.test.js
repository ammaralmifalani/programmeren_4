const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../../index');
// const { database, meal_database } = require('../../database/inmemdb');
const database = require('../../database/dbconnection');
const { getTableLength } = require('../../controller/userController');
const userController = require('../../controller/userController');
// let index = database.users.length;
require('tracer').setLevel('error');
chai.should();
chai.use(chaiHttp);
const logger = require('../utils/utils').logger;
// Test case UC-201.
describe('Register User', function () {
  it('TC-201-1 should register a new user successfully', (done) => {
    const newUser = {
      firstName: 'John',
      lastName: 'Doe',
      isActive: 1,
      emailAdress: 'john.doeNewVersionabcde@example.com', // Ongeldig e-mailadres
      password: 'Abcde@123',
      phoneNumber: '0612345678',
      roles: '',
      street: 'Main Street 123',
      city: 'Amsterdam',
    };
    chai
      .request(app)
      .post('/api/user')
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

        data.should.have.property('firstName').to.be.equal('John');
        data.should.have.property('lastName').to.be.equal('Doe');
        data.should.have.property('street').to.be.equal('Main Street 123');
        data.should.have.property('city').to.be.equal('Amsterdam');
        data.should.have
          .property('emailAdress')
          .to.be.equal('john.doeNewVersionabcd@example.com');
        data.should.have.property('password').to.be.equal('Abcde@123');
        data.should.have.property('phoneNumber').to.be.equal('0612345678');
        done();
      });
  });

  it('TC-201-2 should return an error if email address is invalid', (done) => {
    const newUser = {
      firstName: 'John',
      lastName: 'Doe',
      isActive: 1,
      emailAdress: 'john.doe@.example', // Ongeldig e-mailadres
      password: 'Abcde@123',
      phoneNumber: '0612345678',
      roles: '',
      street: 'Main Street 123',
      city: 'Amsterdam',
    };
    chai
      .request(app)
      .post('/api/user')
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
      firstName: 'John',
      lastName: 'Doe',
      isActive: 1,
      emailAdress: 'john.doeNewVersion@example.com',
      password: 'Abcde@123',
      phoneNumber: '612345678',
      roles: '',
      street: 'Main Street 123',
      city: 'Amsterdam',
    };
    chai
      .request(app)
      .post('/api/user')
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
      firstName: 'John',
      lastName: 'Doe',
      isActive: 1,
      emailAdress: 'john.doeNewVersion@example.com',
      password: 'abcdefg',
      phoneNumber: '0987654321',
      roles: '',
      street: 'Main Street 123',
      city: 'Amsterdam',
    };
    chai
      .request(app)
      .post('/api/user')
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
      firstName: 'John',
      lastName: '',
      isActive: 1,
      emailAdress: 'john.doeNewVersionabcde@example.com', // Ongeldig e-mailadres
      password: 'Abcde@123',
      phoneNumber: '0612345678',
      roles: '',
      street: 'Main Street 123',
      city: 'Amsterdam',
    };
    chai
      .request(app)
      .post('/api/user')
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
      firstName: 'John',
      // lastName: '',
      isActive: 1,
      emailAdress: 'john.doeNewVersionabcde@example.com', // Ongeldig e-mailadres
      password: 'Abcde@123',
      phoneNumber: '0612345678',
      roles: '',
      street: 'Main Street 123',
      city: 'Amsterdam',
    };
    chai
      .request(app)
      .post('/api/user')
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
      firstName: 'John',
      lastName: 1,
      isActive: 1,
      emailAdress: 'john.doeNewVersionabcdehr@example.com', // Ongeldig e-mailadres
      password: 'Abcde@123',
      phoneNumber: '0612345678',
      roles: '',
      street: 'Main Street 123',
      city: 'Amsterdam',
    };
    chai
      .request(app)
      .post('/api/user')
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
      firstName: 'John',
      lastName: 'Doe',
      isActive: 1,
      emailAdress: 'john.doeNewVersionabcdehrsgh@example.com', // Ongeldig e-mailadres
      password: 'Abcde@123',
      phoneNumber: '',
      roles: '',
      street: 'Main Street 123',
      city: 'Amsterdam',
    };
    chai
      .request(app)
      .post('/api/user')
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

        data.should.have.property('firstName').to.be.equal('John');
        data.should.have.property('lastName').to.be.equal('Doe');
        data.should.have.property('street').to.be.equal('Main Street 123');
        data.should.have.property('city').to.be.equal('Amsterdam');
        data.should.have
          .property('emailAdress')
          .to.be.equal('john.doeNewVersionabcdehrsgh@example.com');
        data.should.have.property('password').to.be.equal('Abcde@123');
        data.should.have.property('phoneNumber').to.be.equal(''); // Check if phoneNumber is an empty string
        done();
      });
  });
});
// Test case UC-202
// describe('Get All Users', function () {
//   it('TC-202-1 should return all users in the database', (done) => {
//     chai
//       .request(app)
//       .get('/api/user')
//       .end((err, res) => {
//         expect(err).to.be.null;

//         // Get the expected length of the user table
//         getTableLength('user', (tableErr, tableLength) => {
//           if (tableErr) {
//             logger.error(tableErr);
//           }

//           res.body.should.be.an('object');
//           res.body.should.have.property('status').to.be.equal(200);
//           res.body.should.have.property('message');
//           res.body.should.have.property('data');
//           let { data, message, status } = res.body;
//           data.should.be.an('array');
//           message.should.be.equal('server info-endpoint');
//           data.length.should.be.equal(tableLength);
//           done();
//         });
//       });
//   });
// });
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
          message.should.be.equal('server info-endpoint');
          data.length.should.be.equal(tableLength);
          done();
        });
      });
  });
});
// Test case UC-203
describe('Get User Profile', function () {
  it('TC-203-2 should return user profile data', (done) => {
    const credentials = {
      emailaddress: 'ammar@gmail.com',
      password: 'P@ssw0rd!',
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
        data.should.be.an('object');
        message.should.be.equal('Profielgegevens opgehaald');
        data.should.have.property('firstname').to.be.equal('Ammar');
        data.should.have.property('lastname').to.be.equal('almifalani');
        done();
      });
  });

  it('TC-203-3 should return error if user not found', (done) => {
    const credentials = {
      emailaddress: 'nonexistentuser@example.com',
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

  it('TC-203-4 should return error if password is incorrect', (done) => {
    const credentials = {
      emailaddress: 'ammar@gmail.com',
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
  it('TC-205-1 should update user data', (done) => {
    const requestData = {
      emailaddress: 'ammar@gmail.com',
      password: 'P@ssw0rd!',
      updateData: {
        firstname: 'UpdatedAmmar',
        lastname: 'UpdatedAlmifalani',
        street: '456 Updated St',
        city: 'UpdatedAmsterdam',
        newPassword: 'NewP@ssw0rd!',
        phonenumber: '0698765432',
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
        message.should.be.equal('Gebruiker is met succes bijgewerkt');
        data.should.be.an('object');
        data.should.have
          .property('firstname')
          .to.be.equal(requestData.updateData.firstname);
        data.should.have
          .property('lastname')
          .to.be.equal(requestData.updateData.lastname);
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
          .property('phonenumber')
          .to.be.equal(requestData.updateData.phonenumber);
        done();
      });
  });

  it('TC-205-2 should return error if user not found', (done) => {
    const requestData = {
      emailaddress: 'nonexistentuser@example.com',
      password: 'P@ssw0rd!',
      updateData: {
        firstname: 'UpdatedAmmar',
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
        message.should.be.equal('Gebruiker niet gevonden');
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });

  it('TC-205-3 should return error if password is incorrect', (done) => {
    const requestData = {
      emailaddress: 'ammar@gmail.com',
      password: 'IncorrectPassword!',
      updateData: {
        firstname: 'UpdatedAmmar',
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
        message.should.be.equal('Ongeldig wachtwoord');
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });
});
// Test case UC-206
describe('Delete User', function () {
  it('TC-206-1 should delete user', (done) => {
    const credentials = {
      emailaddress: 'testuser@gmail.com',
      password: 'P@ssw0rd!',
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
        message.should.be.equal('Gebruiker is met succes verwijderd');
        Object.keys(data).length.should.be.equal(0);

        done();
      });
  });

  it('TC-206-2 should return error if user not found', (done) => {
    const credentials = {
      emailaddress: 'nonexistentuser@example.com',
      password: 'P@ssw0rd!',
    };
    chai
      .request(app)
      .delete('/api/user/delete')
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

  it('TC-206-3 should return error if password is incorrect', (done) => {
    const credentials = {
      emailaddress: 'ammar@gmail.com',
      password: 'IncorrectPassword!',
    };
    chai
      .request(app)
      .delete('/api/user/delete')
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
