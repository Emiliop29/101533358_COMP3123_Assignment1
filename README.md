# COMP3123 Assignment 1 — Employee Management REST API

## Project Description

This project is a RESTful Employee Management API developed for COMP3123 Assignment 1.

The application allows users to register, log in, and manage employee records. Authentication is implemented using JSON Web Tokens (JWT), and employee records are associated with their respective owners.

## Technologies Used

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JSON Web Token (JWT)
- bcryptjs
- express-validator
- Helmet
- express-rate-limit
- Morgan
- dotenv
- Postman
- Vercel

## Project Structure

```text
Comp3123/
├── config/
│   └── db.js
├── controllers/
│   ├── employeeController.js
│   └── userController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── rateLimiter.js
├── models/
│   ├── employee.js
│   └── user.js
├── routes/
│   ├── employeeRoutes.js
│   └── userRoutes.js
├── server.js
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
└── README.md
```

## Installation

1. Clone the GitHub repository.
2. Open the project folder.
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file based on `.env.example`.
5. Configure the MongoDB connection string and JWT secret.
6. Start the application:

```bash
npm start
```

The local API runs at:

```text
http://localhost:3000
```

## Environment Variables

The application uses environment variables to protect sensitive configuration information.

Configure the required MongoDB connection string, JWT secret, and application port in `.env`.

Do not commit `.env` or real credentials to GitHub.

## API Endpoints

### User Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/user/signup` | Register a new user |
| POST | `/api/v1/user/login` | Authenticate and receive JWT |

### Employee Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/emp/employees` | Retrieve employees |
| POST | `/api/v1/emp/employees` | Create an employee |
| GET | `/api/v1/emp/employees/:id` | Retrieve employee by ID |
| PUT | `/api/v1/emp/employees/:id` | Update an employee |
| DELETE | `/api/v1/emp/employees?id=:id` | Delete an employee |

Employee endpoints require JWT authentication.

## Authentication and Authorization

Users authenticate with their username and password. Successful login returns a JWT.

Protected requests must include the following header:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

Employee records are associated with their owners using a MongoDB user ObjectId.

The API enforces employee ownership. A user cannot retrieve, modify, or delete employees belonging to another user.

## Security Features

- Password hashing using bcryptjs
- JWT authentication
- Employee ownership authorization
- Helmet HTTP security headers
- Rate limiting
- Request input validation
- Centralized error handling
- Environment-based configuration

The employee API rate limiter is configured for 100 requests per 15-minute window. Excessive requests return HTTP 429.

## Error Handling

The API handles scenarios including:

- Duplicate users
- Incorrect login credentials
- Missing or invalid JWT
- Invalid employee IDs
- Invalid employee input
- Missing employees
- Unauthorized access to another user's employees
- Unknown endpoints
- Excessive API requests

## Logging

Morgan records HTTP request information during local execution, including request methods, paths, status codes, and response times.

Application startup also logs database connection and server startup status.

Sensitive credentials and JWT secrets should not be included in application logs.

## Health Check

Endpoint:

```text
GET /health
```

Expected successful response:

```json
{
  "status": "success",
  "message": "COMP3123 Assignment 1 API is running"
}
```

## MongoDB Database

Database name:

```text
comp3123_assignment1
```

Collections:

- `users`
- `employees`

User passwords are stored as bcrypt hashes.

Employee documents include a `user` field referencing the employee owner's user ObjectId, along with creation and update timestamps.

## Postman Testing

The API was tested using Postman for successful and unsuccessful requests.

Tests include user registration, login, employee CRUD operations, JWT authentication, input validation, duplicate registration, invalid credentials, rate limiting, and two-user ownership authorization.

The exported Postman collection and supporting screenshots are included in the assignment submission.

## Deployment

The application is deployed on Vercel.

**Live API:**

https://comp-3123-assignment1-chi.vercel.app

**Health Check:**

https://comp-3123-assignment1-chi.vercel.app/health

