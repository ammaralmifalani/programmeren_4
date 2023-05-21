// Validates the email using a regular expression
/*
Voor e-mail:
"Please enter your email address in the following format: a letter followed by a dot and then two or more letters, an '@' symbol, followed by two or more letters, a dot, and finally, two or three letters. For example: a.example@example.com."

Voor wachtwoord:
"Your password should be at least 8 characters long, and must include at least one uppercase letter and one number. For example: Password1."

Voor telefoonnummer:
"Please enter your phone number in the following format: '06' followed by an optional hyphen or space, and then eight digits. For example: 06-12345678 or 0612345678."


*/
const bcrypt = require('bcrypt');
const VALID_FIELDS = [
  'id',
  'firstName',
  'lastName',
  'emailAdress',
  'phoneNumber',
  'city',
  'street',
  'isActive',
  'roles',
];
function buildSqlStatement(queryField) {
  let sqlStatement =
    'SELECT id, firstName, lastName, emailAdress, password, phoneNumber, city, street, isActive, roles FROM `user`';
  let params = [];
  let conditions = [];
  let invalidFieldName = null;

  for (let field in queryField) {
    let value = queryField[field];

    if (!VALID_FIELDS.includes(field)) {
      invalidFieldName = field;
      break;
    }

    if (!value) continue;

    if (value.toLowerCase() === 'true') {
      value = 1;
    } else if (value.toLowerCase() === 'false') {
      value = 0;
    }

    conditions.push(`\`${field}\` = ?`);
    params.push(value);
  }

  if (invalidFieldName) {
    return { error: `Invalid field in filter: ${invalidFieldName}.` };
  }

  if (conditions.length > 0) {
    sqlStatement += ' WHERE ' + conditions.slice(0, 2).join(' AND ');
  }

  return { sqlStatement, params };
}
function validateEmail(email) {
  const regex = /^[a-z]{1,1}\.[a-z]{2,}@[a-z]{2,}\.[a-z]{2,3}$/i;

  return regex.test(email);
}
// Validates the password using a regular expression
function validatePassword(password) {
  const regex = /^(?=.*\d)(?=.*[A-Z]).{8,}$/;
  return regex.test(password);
}
// Validates the phone number using a regular expression
function validatePhoneNumber(phoneNumber) {
  if (!phoneNumber) {
    return true; // Empty phone numbers are allowed
  }
  const regex = /^06[-\s]?\d{8}$/;
  return regex.test(phoneNumber);
}
function convertIsActiveToBoolean(user) {
  if (!user) {
    return user;
  }

  return {
    ...user,
    isActive: user.isActive === 1,
  };
}

function convertMealProperties(meal) {
  if (!meal) {
    return meal;
  }
  return {
    ...meal,
    isActive: meal.isActive === 1,
    isVega: meal.isVega === 1,
    isVegan: meal.isVegan === 1,
    isToTakeHome: meal.isToTakeHome === 1,
    price: parseFloat(meal.price),
  };
}
// Hashing function
function hashPassword(password, callback) {
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, callback);
}

function getRandomEmail() {
  const randomString = Math.random().toString(36).substring(2, 7); // Genereert een willekeurige tekenreeks van 5 karakters
  return `john.doe${randomString}@example.com`;
}
// Exporting validation functions for email, password, and phone number
module.exports = {
  validateEmail: validateEmail,
  validatePassword: validatePassword,
  validatePhoneNumber: validatePhoneNumber,
  getRandomEmail: getRandomEmail,
  convertIsActiveToBoolean: convertIsActiveToBoolean,
  convertMealProperties: convertMealProperties,
  buildSqlStatement: buildSqlStatement,
  hashPassword: hashPassword,
};
