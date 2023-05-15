const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../../index');
const dbconnection = require('../../database/dbconnection');
const { getTableLength } = require('../../controller/userController');
const logger = require('../utils/utils').logger;
require('tracer').setLevel('debug');
chai.should();
chai.use(chaiHttp);
let token = '';
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
const emailAdress_test = 'j.doe@gmail.com';
const password_test = 'Secret123';
/**
 * Voeg een user toe aan de database. Deze user heeft id 1.
 * Deze id kun je als foreign key gebruiken in de andere queries, bv insert meal.
 */
const INSERT_USER =
  'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
  '(1, "John", "Doe", "j.doe@gmail.com", "Secret123", "street", "city"),' +
  '(2, "Mo", "Doe", "M.doe@gmail.com", "Secret123", "street", "city");';
const INSERT_MEALS =
  'INSERT INTO `meal` (`name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
  "('Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
  "('Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

describe('Meal API', () => {
  logger.trace('Meal API');
  beforeEach((done) => {
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(
        CLEAR_DB + INSERT_USER,
        function (error, results, fields) {
          if (error) throw error;

          connection.query(INSERT_MEALS, function (error, results, fields) {
            connection.release();
            if (error) throw error;
            done();
          });
        }
      );
    });
  });

  describe('UC-303 | Overview of meals', () => {
    it('TC-303-1 | List of meals returned', (done) => {
      chai
        .request(app)
        .get('/api/meal')
        .end((err, res) => {
          res.body.should.be.a('object');
          let { status, message, data } = res.body;
          status.should.eql(200);
          message.should.be.a('string').eql('Meal getAll endpoint');
          data.should.be.a('array');
          data.length.should.be.eql(2);
          done();
        });
    });
  });
});
