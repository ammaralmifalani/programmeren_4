
let database = {
    users: [
      {
        id: 0,
        firstname: 'Ammar',
        lastname: 'almifalani',
        emailaddress: 'ammar@gmail.com',
        street: '123 Main St',
        city: 'Amsterdam',
        password: 'P@ssw0rd!',
        phonenumber: '0612345678',
      },
      {
        id: 1,
        firstname: 'Mohammed',
        lastname: 'Samadov',
        emailaddress: 'mohammed@gmail.com',
        street: '123 Main St',
        city: 'Amsterdam',
        password: 'P@ssw0rd!',
        phonenumber: '0612345678',
      },
      {
        id: 2,
        firstname: 'Test',
        lastname: 'User',
        emailaddress: 'testuser@gmail.com',
        street: '123 Test St',
        city: 'Amsterdam',
        password: 'P@ssw0rd!',
        phonenumber: '0612345678',
      },
    ],
  };
  let meal_database = {
    meals: [
      {
        id: 1,
        name: 'Spaghetti Bolognese',
        description: "Heerlijke spathetti, de klassieker onder de pasta's.",
        isActive: false,
        isVega: false,
        isVegan: false,
        isToTakeHome: true,
        dateTime: '2023-04-03T11:09:42.000Z',
        createDate: '2023-04-03T11:11:26.785Z',
        updateDate: '2023-04-03T11:12:14.000Z',
        maxAmountOfParticipants: 6,
        price: '5.50',
        imageUrl:
          'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3.jpg',
        allergenes: [],
        cook: {
          roles: [],
          isActive: true,
          id: 0,
          firstname: 'Ammar',
          lastname: 'almifalani',
          emailaddress: 'ammar@gmail.com',
          street: '123 Main St',
          phonenumber: '0612345678',
        },
        participants: [
          {
            roles: [],
            isActive: true,
            id: 0,
            firstname: 'Ammar',
            lastname: 'almifalani',
            emailaddress: 'ammar@gmail.com',
            street: '123 Main St',
            phonenumber: '0612345678',
          },
        ],
      },
    ],
  };

module.exports = {database,meal_database};