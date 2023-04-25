# Share-a-Meal API Server

Dit is de API-server voor het Share-a-Meal project. Share-a-Meal is een platform waar gebruikers maaltijden kunnen delen met anderen in hun omgeving. Deze server is gebouwd met Node.js en Express en maakt gebruik van MySQL voor de database.

## Vereisten

- Node.js
- MySQL

## Installatie

1. Clone deze repository:

git clone <>

2. Navigeer naar de projectmap en installeer de vereiste pakketten:

cd share_a_meal_server
npm install

3. Maak een `.env`-bestand aan in de hoofdmap van het project en voeg de volgende variabelen toe, met je eigen waarden:

DB_HOST=<your_database_host>
DB_PORT=<your_database_port>
DB_USER=<your_database_user>
DB_PASSWORD=<your_database_password>
DB_DATABASE=<your_database_name>

4. Start de API-server:

npm start

De server moet nu draaien op `http://localhost:3000` of de poort die je hebt opgegeven in je `.env`-bestand.

## API Endpoints

- `GET /api/users`: Haal alle gebruikers op
- `GET /api/users/:id`: Haal een gebruiker op op basis van ID
- `POST /api/users`: Maak een nieuwe gebruiker aan
- `PUT /api/users`: Werk een bestaande gebruiker bij op basis van e-mailadres en password
- `DELETE /api/users`: Verwijder een gebruiker op basis van e-mailadres en password
