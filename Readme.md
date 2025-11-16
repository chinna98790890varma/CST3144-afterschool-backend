# AfterSchool Backend API

## Project Overview

This is an Express.js backend API for booking after-school classes. The API provides endpoints for managing lessons, searching classes, updating availability, and processing orders. It uses MongoDB Atlas as the database.

## Repository Links

### [Express.js App] GitHub Repository:

https://github.com/chinna98790890varma/CST3144-afterschool-backend

### [Express.js App] Deployed URL (Render.com):

https://cst3144-afterschool-backend.onrender.com

## Technology Stack

- **Runtime**: Node.js 20.x
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Package Manager**: npm

## Features

- RESTful API for managing after-school classes
- Search lessons by subject, location, price, or availability
- Update lesson availability
- Create and process orders
- Automatic sample data initialization
- CORS enabled for frontend integration
- Image serving support

## Installation

1. Clone the repository:
```bash
git clone https://github.com/chinna98790890varma/CST3144-afterschool-backend.git
```

2. Navigate to the project directory:
```bash
cd CST3144-afterschool-backend
```

3. Install dependencies:
```bash
npm install
```

## Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
FRONTEND_URL=http://localhost:5173
```

### Environment Variables

- `PORT`: Server port (default: 5000)
- `MONGODB_URI` or `MONGO_URI`: MongoDB connection string
- `FRONTEND_URL`: Frontend URL for CORS configuration (default: `*`)

## Development

Run the development server:
```bash
npm start
```

Or:
```bash
npm run dev
```

The server will be available at `http://localhost:5000`

## API Endpoints

### GET /lessons

Fetch all available lessons.

**Response:**
```json
[
  {
    "_id": "lesson_id",
    "subject": "Mathematics",
    "location": "London",
    "price": 100,
    "space": 5,
    "icon": "fa-calculator"
  }
]
```

### GET /search?query=term

Search lessons by subject, location, price, or availability.

**Query Parameters:**
- `query`: Search term (subject, location, price, or space)

**Response:**
```json
[
  {
    "_id": "lesson_id",
    "subject": "Mathematics",
    "location": "London",
    "price": 100,
    "space": 5,
    "icon": "fa-calculator"
  }
]
```

### PUT /lessons/:id

Update lesson information.

**URL Parameters:**
- `id`: Lesson ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "space": 10,
  "price": 120
}
```

**Response:**
```json
{
  "message": "Lesson availability updated successfully"
}
```

### POST /orders

Create a new order.

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "1234567890",
  "lessons": [
    {
      "id": "lesson_id",
      "quantity": 2
    }
  ]
}
```

**Response:**
```json
{
  "_id": "order_id",
  "name": "John Doe",
  "phone": "1234567890",
  "lessons": [
    {
      "id": "lesson_id",
      "subject": "Mathematics",
      "quantity": 2
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

### GET /images/:filename

Serve lesson images (if available).

**URL Parameters:**
- `filename`: Image filename

## Database

### Collections

- **lessons**: Stores lesson information
  - `subject`: String
  - `location`: String
  - `price`: Number
  - `space`: Number
  - `icon`: String

- **orders**: Stores order information
  - `name`: String
  - `phone`: String
  - `lessons`: Array
  - `createdAt`: Date

### Sample Data

The server automatically initializes sample lessons if the database is empty.

## Project Structure

```
backend/
├── server.js          # Main server file
├── package.json       # Project dependencies
├── .env              # Environment variables (create this)
└── images/           # Image assets (optional)
```

## Deployment

The application is configured for deployment on Render.com or similar platforms. Ensure environment variables are set in your deployment platform.

### MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster
2. Configure network access (add `0.0.0.0/0` for testing or specific IP ranges)
3. Create a database user
4. Get the connection string
5. Set `MONGODB_URI` environment variable in your deployment platform

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error message"
}
```
