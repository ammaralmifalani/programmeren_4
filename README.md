# Share-a-Meal API Server
## Introduction
This is the API server for the Share-a-Meal project. Share-a-Meal is a platform where users can share meals with others in their local area. This server is built with Node.js and Express and uses MySQL for the database.
## Requirements
- Node.js
- MySQL
## Installation
### Step 1: Clone the Repository

`git clone https://github.com/ammaralmifalani/shareameal_api_server.git`
### Step 2: Install Dependencies
Navigate to the project folder and install the required packages:
- `cd share_a_meal_server`
- `npm install` 
### Step 3: Import Database Structure
Create a new MySQL database for your project and import the share-a-meal.sql file to set up the necessary tables and structures:
- mysql -u <your_database_user> -p <your_database_name> < share-a-meal.sql
### Step 4: Configure Environment Variables
Create a `.env` file in the root folder of the project and add the following variables, using your own values:
- DB_HOST=<your_database_host>
- DB_PORT=<your_database_port>
- DB_USER=<your_database_user>
- DB_PASSWORD=<your_database_password>
- DB_DATABASE=<your_database_name>
### Step 5: Start the API Server

`npm start`

The server should now be running at `http://localhost:3000` or the port you specified in your `.env` file.
## API Endpoints
### Server Information
- `GET /api/info` : Retrieve server information
### Users
- `GET /api/user`: Get all users
- `GET /api/user/:id`: Get a user by ID
- `POST /api/user`: Create a new user
- `PUT /api/user`: Update an existing user based on email address 
- `DELETE /api/user`: Delete a user based on email address

The following endpoints require a request body:

- `POST /api/user`: Create a new user (fields with an asterisk are required)

````json
{
    "firstName": "John", *
    "lastName": "Doe", *
    "emailAdress": "john.doe@example.com", *
    "password": "Abcd@123", *
    "phoneNumber": "",|| "0684584855"
    "street": "Main Street 123", *
    "city": "Amsterdam" *
}
````
- `DELETE /api/user`: Delete a user based on email address
  
````json
{
    "emailAdress": "john.doe76pah@example.com",

}

````
- `PUT /api/user`: Update an existing user based on email address 

````json 
{
    "emailAdress": "j.doe@server.com",
    "updateData": {
      "firstName": "John", 
      "lastName": "Doe", 
      "isActive": 1,
      "emailAdress": "john.doe@example.com", 
      "password": "Abcd@123", 
      "phoneNumber": "",
      "roles": "",
      "street": "Main Street 123", 
      "city": "Amsterdam" *
    }
}
````
## Deployment

The API server has been deployed and can be accessed at `https://share-a-meal-api-server.up.railway.app`. 

You can use the same endpoints as described in the "API Endpoints" section, just replace `http://localhost:3000` with the deployment URL.

For example, to get all users, you can send a GET request to `https://share-a-meal-api-server.up.railway.app/api/user`.
