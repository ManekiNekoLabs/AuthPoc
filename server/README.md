# Backend Server for Auth POC

This is the backend server for the Authentication Proof of Concept application.

## Prerequisites

Before running the server, make sure you have the following installed:
- Node.js (version 12 or higher)
- npm (usually comes with Node.js)

## Setup

1. Navigate to the backend directory:
   ```
   cd path/to/backend
   ```

2. Install the required dependencies:
   ```
   npm install
   ```

## Running the Server

To start the backend server, follow these steps:

1. Make sure you're in the backend directory.

2. Run the following command:
   ```
   node server.js
   ```

   Or, if you prefer to use `npm`, you can add a script to your `package.json`:
   ```json
   "scripts": {
     "start": "node server.js"
   }
   ```
   Then run:
   ```
   npm start
   ```

3. You should see a message indicating that the server is running:
   ```
   Backend server is running on port 8000
   ```

The server will now be running on `http://localhost:8000`.

## API Endpoints

The server provides the following endpoints:

- POST `/user/signin`: For user authentication
- POST `/user/mfalogin`: For multi-factor authentication

Refer to the server code for more details on the request and response formats for these endpoints.

## Notes

- Make sure the frontend application is configured to send requests to `http://localhost:8000`.
- The server uses CORS to allow requests from `http://localhost:3000`. If your frontend is running on a different port, update the CORS configuration in `server.js`.

## Troubleshooting

If you encounter any issues:
- Ensure all dependencies are installed correctly.
- Check that the port 8000 is not being used by another application.
- Verify that your frontend is sending requests to the correct URL.

For any other problems, please refer to the error messages in the console or contact the development team.

