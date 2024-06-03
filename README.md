# Email Client Sync Project

This project is designed to sync emails from various providers (currently Outlook) to an Elasticsearch database, providing real-time updates.

## Prerequisites

Ensure you have the following installed:

- [Docker](https://www.docker.com/products/docker-desktop)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (for local development without Docker)

## Project Structure
![image](https://github.com/ahmedkhan1/email-client-app/assets/26416009/aa653e98-90e8-46f1-92fd-11be8307da99)


## Setup Instructions

### 1. Clone the Repository

```sh
git clone https://github.com/yourusername/email-sync-project.git
cd email-sync-project
```

### 2. Environment Variables
Ensure you have the required environment variables set up in the .env files for both the frontend and backend. There is env-example file for each project avaialbe to give you an idea:

For backend:
```sh
PORT=3000
ELASTICSEARCH_URL=
ELASTICSEARCH_USERNAME=
ELASTICSEARCH_PASSWORD=

# OUTLOOK ENV
# tenantId = 
OUTLOOK_CLIENT_ID=
OUTLOOK_CLIENT_SECRET=
OUTLOOK_REDIRECT_URI=

# AUth Env
JWT_SECRET=
```

For frontend:
```sh
PORT=
REACT_APP_BASE_URL=
```

### 3. Build and Run with Docker
Ensure Docker is running on your machine, then use Docker Compose to build and run the services.

```sh
docker-compose up --build
```

### This command will:

Build the Docker images for the frontend and backend.
Start the containers.
The backend will be available on http://localhost:3000.
The frontend will be available on http://localhost:5000.


### 4. Access the Application
Open your browser and go to http://localhost:5000 to access the frontend application.



### Development
### Backend Development
To run the backend server locally without Docker:

Navigate to the backend directory

```sh
cd backend
```

Install the dependencies:
```sh
npm install
```

Start the server:
```sh
npm start
```

### Frontend Development
To run the frontend application locally without Docker:

Navigate to the frontend directory:
```sh
cd frontend
```

Install the dependencies:
```sh
npm install
```

Start the development server:
```sh
npm start
```
