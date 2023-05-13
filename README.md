# :plate_with_cutlery: Share-a-Meal API Server
[![Deploy to Railway](../shareameal_api_server/badge.svg)](https://github.com/ammaralmifalani/shareameal_api_server/actions/workflows/main.yml)
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
npm install
```
### :floppy_disk: Step 3: Import Database Structure
Create a new MySQL database for your project and import the share-a-meal.sql file to set up the necessary tables and structures:
```bash
 mysql -u <your_database_user> -p <your_database_name> < share-a-meal.sql
```
### :memo: Step 4: Configure Environment Variables

Create a `.env` file in the root folder of the project and add the following variables, using your own values:
```bash
- DB_HOST=<your_database_host>
- DB_PORT=<your_database_port> 
- DB_USER=<your_database_user> 
- DB_PASSWORD=<your_database_password>
- DB_DATABASE=<your_database_name>
```
### :cd: Step 5: Start the database
```bash
 [XAMPP](https://www.apachefriends.org/index.html)
 ```
### :rocket: Step 6: Start the API Server

```bash
  npm run dev
```
The server should now be running at `http://localhost:3000` or the port you specified in your `.env` file.
## :microscope: Running Tests
To run tests, run the following command
```bash
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

- `POST /api/user`: Create a new user (fields with an asterisk are required)

````json
{
    "firstName": "John", *
    "lastName": "Doe", *
    "emailAdress": "j.doe@example.com", *
    "password": "Abcd@123", *
    "phoneNumber": "",|| "0684584855" ||"06 84584855"||"06-84584855"
    "street": "Main Street 123", *
    "city": "Amsterdam" *
}
````
- `PUT /api/user/:id`: Update an existing user based on a valid token.  

````json 
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
````
## :mag: Regular Expressions
We use regular expressions (regex) to validate user input. Here's an explanation of the regex patterns we're using:

### 1. Email: ^[a-z]{1,1}\.[a-z]{2,}@[a-z]{2,}\.[a-z]{2,3}$
- This pattern checks if the input is a valid email address.
- The email should start with a lowercase letter followed by a dot.
- After the dot, there should be at least two lowercase letters.
- The "@" symbol should follow next.
- After the "@", there should be at least two lowercase letters, followed by a dot.
- Finally, there should be between two to three lowercase letters.
### 2. Password: ^(?=.*\d)(?=.*[A-Z]).{8,}$

- This pattern checks for a valid password.
- The password should be at least 8 characters long.
- It should contain at least one digit (?=.*\d).
- It should contain at least one uppercase letter (?=.*[A-Z]).
### 3. Phone number: ^06[-\s]?\d{8}$ or empty

- This pattern checks for a valid Dutch phone number or an empty input.
- The phone number should start with "06" followed by an optional dash or space, and then 8 digits.
## :airplane: Deployment

The API server has been deployed and can be accessed at `https://share-a-meal-api-server.up.railway.app`. 

You can use the same endpoints as described in the "API Endpoints" section, just replace `http://localhost:3000` with the deployment URL.

For example, to get all users, you can send a GET request to `https://share-a-meal-api-server.up.railway.app/api/user`.
