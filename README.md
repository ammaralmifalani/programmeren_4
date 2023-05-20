# :plate_with_cutlery: Share-a-Meal API Server
[![Deploy to Railway](./badge.svg)](https://github.com/ammaralmifalani/shareameal_api_server/actions/workflows/main.yml)
## :book: Introduction
This is the API server for the Share-a-Meal project. Share-a-Meal is a platform where users can share meals with others in their local area. This server is built with Node.js and Express and uses MySQL for the database.
## :clipboard: Requirements 
- :deciduous_tree: Node.js 
- :train2: Express.js 
- :floppy_disk: MySQL 
## :inbox_tray: Installation
### :file_folder: Step 1: Clone the Repository
```bash
git clone https://github.com/ammaralmifalani/shareameal_api_server.git
```
### :wrench: Step 2: Install Dependencies
Navigate to the project folder and install the required packages:
```bash
cd share_a_meal_server
```
```js
npm install
```
### :floppy_disk: Step 3: Import Database Structure
Create a new MySQL database for your project and import the share-a-meal.sql file to set up the necessary tables and structures:
```sh
 mysql -u <your_database_user> -p <your_database_name> < share-a-meal.sql
``` 
or 
```bash
 mysql -u root
```
```sql
  CREATE DATABASE your_database_name;
  USE your_database_name;
  SOURCE share-a-meal.sql;
```
### :memo: Step 4: Configure Environment Variables

Create a `.env` file in the root folder of the project and add the following variables, using your own values:
```env
 DB_HOST=<your_database_host>
 DB_PORT=<your_database_port> 
 DB_USER=<your_database_user> 
 DB_PASSWORD=<your_database_password>
 DB_DATABASE=<your_database_name>
 ```
### :cd: Step 5: Start the database
Start your MySQL database. If you're using a local development environment like [XAMPP](https://www.apachefriends.org/index.html), ensure the MySQL service is running. 
### :rocket: Step 6: Start the API Server

```js
  npm run dev
```
The server should now be running at `http://localhost:3000` or the port you specified in your `.env` file.
## :microscope: Running Tests
This project uses Mocha as a test framework and Chai for assertions.
To run tests, run the following command: 
```js
  npm run test
```
## :link: API Endpoints
### Server Information
- `GET /api/info` : Retrieve server information
### Users

- `POST /api/login`: Log in with email and password.
- `GET /api/user`: Get all users.
- `GET/api/user/profile`: Get an existing user based on a valid token.
- `GET /api/user/:id`: Get a user by ID (requires valid token).
- `POST /api/user`: Create a new user
- `PUT /api/user/:id`: Update an existing user based on a valid token. 
- `DELETE /api/user/:id`: Delete a user based on a valid token.

The following endpoints require a request body:

- `POST /api/login`: Log in with email and password.
```json
{
    "emailAdress": "j.doe@example.com",
    "password": "Secret12"
}

```
- `POST /api/user`: Create a new user (fields with an asterisk are required)

```json
{
    "firstName": "John", *
    "lastName": "Doe", *
    "emailAdress": "j.doe@example.com", *
    "password": "Abcd@123", *
    "phoneNumber": "",|| "0684584855" ||"06 84584855"||"06-84584855"
    "street": "Main Street 123", *
    "city": "Amsterdam" *
}
```
- `PUT /api/user/:id`: Update an existing user based on a valid token.  

```json 
{
    "updateData": {
      "firstName": "John", 
      "lastName": "Doe", 
      "isActive": 1,
      "emailAdress": "j.doe@example.com", 
      "password": "Secret12", 
      "phoneNumber": "",|| "0684584855" ||"06 84584855"||"06-84584855"
      "roles": "",
      "street": "Main Street 123", 
      "city": "Amsterdam" *
    }
}
```
### Meals

- `POST/api/meal`: Create a new meal
- `GET/api/meal`: Get all meals.
- `GET/api/meal/:mealId`:  Retrieve a specific meal by its ID (requires a valid token).
- `DELETE/api/meal/:mealId`:Delete a specific meal by its ID (requires a valid token).
- `PUT/api/meal/:id`: Update a specific meal by its ID (requires a valid token). 
- `POST/api/meal/:mealId/participate`:Sign up a user to participate in a specific meal (requires a valid token).
- `DELETE/api/meal/:mealId/participate`: Cancels a user's participation in a specified meal (requires a valid token).
- `GET/api/meal/:mealId/participants`: Retrieve a list of all participants for a specific meal (requires a valid token).
- `GET/api/meal/:mealId/participants/:participantId`:Retrieve the details of a specific participant for a specific meal (requires a valid token).
  
 The following endpoints require a request body:

 - `POST /api/meal`: Create a new meal

```json
 {
"name":"Spaghetti Bolognese",
"description":"Dé pastaklassieker bij uitstek.",
"dateTime":"2023-05-22 17:35:00",
"imageUrl":"https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
"maxAmountOfParticipants":20,
"price":6.75
}
```

- `PUT/api/meal/:id`: Update an existing meal based on a valid token.
  
```json
  {
"name":"Spaghetti Bolognese",
"description":"Dé pastaklassieker bij uitstek.",
"isActive":true,
"isVega":true,
"isVegan":true,
"isToTakeHome":true,
"dateTime":"2023-05-22 17:35:00",
"imageUrl":"https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
"allergenes":["gluten","noten","lactose"],
"maxAmountOfParticipants":20,
"price":6.75
}
```
## :airplane: Deployment

The API server has been deployed and can be accessed at `https://share-a-meal-api-server.up.railway.app`. 

You can use the same endpoints as described in the "API Endpoints" section, just replace `http://localhost:3000` with the deployment URL.

For example, to get all users, you can send a GET request to `https://share-a-meal-api-server.up.railway.app/api/user`.

