// Validates the email using a regular expression
/*
Voor e-mail:
"Please enter your email address in the following format: a letter followed by a dot and then two or more letters, an '@' symbol, followed by two or more letters, a dot, and finally, two or three letters. For example: a.example@example.com."

Voor wachtwoord:
"Your password should be at least 8 characters long, and must include at least one uppercase letter and one number. For example: Password1."

Voor telefoonnummer:
"Please enter your phone number in the following format: '06' followed by an optional hyphen or space, and then eight digits. For example: 06-12345678 or 0612345678."


*/
function validateEmail(email) {
  // const regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  const regex = /^[a-z]{1,1}\.[a-z]{2,}@[a-z]{2,}\.[a-z]{2,3}$/i;

  return regex.test(email);
}
// Validates the password using a regular expression
function validatePassword(password) {
  // const regex =
  //   /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/;
  const regex = /^(?=.*\d)(?=.*[A-Z]).{8,}$/;
  return regex.test(password);
}
// Validates the phone number using a regular expression
function validatePhoneNumber(phoneNumber) {
  if (!phoneNumber) {
    return true; // Empty phone numbers are allowed
  }
  // const regex = /^\d{10}$/;
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
  };
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
};
