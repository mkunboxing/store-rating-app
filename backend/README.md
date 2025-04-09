# Store Rating System Backend

This is the backend server for the Store Rating System, built with Express.js and PostgreSQL.

## Features

- User authentication and authorization
- Role-based access control (Admin, Normal User, Store Owner)
- Store management
- Rating system
- User management
- Dashboard statistics

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database (NeonDB)
- npm or yarn package manager

## Setup

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=your_neondb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=24h
   PORT=5000
   ```
5. Initialize the database:
   - Use the schema.sql file in the config directory to create the necessary tables
   - You can run this directly in your NeonDB console or using a PostgreSQL client

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- PUT /api/auth/password - Update password (authenticated)

### Users
- GET /api/users - Get all users (admin only)
- GET /api/users/:id - Get user details (admin only)
- POST /api/users - Add new user (admin only)
- GET /api/users/stats/dashboard - Get dashboard stats (admin only)

### Stores
- GET /api/stores - Get all stores (authenticated)
- POST /api/stores - Add new store (admin only)
- GET /api/stores/my-store - Get store owner's store details (store owner only)

### Ratings
- POST /api/ratings/:storeId - Submit/update rating
- GET /api/ratings/store/:storeId - Get store ratings

## Error Handling

The API returns appropriate HTTP status codes and error messages:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error 