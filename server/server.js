// backend/server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // You'll need to install this package

const app = express();
const PORT = 8000;

app.use(cors({
  origin: 'http://localhost:3000', // Allow React app to connect
  methods: 'GET,POST,PUT,DELETE',
  credentials: true,
}));
app.use(express.json());


app.post('/user/signin', async (req, res) => {
  const { username, password, portal } = req.body;
  console.log('Received /signin request:', { username, portal });

  try {
    const response = await axios.post(
      'https://userapi.sensablehealth.net/user/signin',
      { username, password, portal },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
        },
      }
    );

    const {
      userId,
      changePassword,
      smsMfaRequired,
      session,
      firstname,
      middlename,
      lastname,
      phonenumber,
      groups
    } = response.data;

    console.log('Authentication successful. Session received:', session);

    res.json({
      userId,
      changePassword,
      smsMfaRequired,
      session, // This will be used as the bearer token
      firstname,
      middlename,
      lastname,
      phonenumber,
      groups
    });
  } catch (error) {
    console.error('Error during sign-in:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({
      message: error.response ? error.response.data.message : 'Internal Server Error',
    });
  }
});

// single-use code login
app.post('/user/mfalogin', async (req, res) => {
  const { mfaCode, portal, session, userId } = req.body;
  console.log('Received /mfalogin request:', { mfaCode, portal, userId });

  if (!session) {
    return res.status(403).json({ message: 'No session provided' });
  }

  try {
    const response = await axios.post(
      'https://userapi.sensablehealth.net/user/mfalogin',
      { mfaCode, portal, session, userId },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session}`,
        },
      }
    );

    console.log('MFA login successful');
    res.json(response.data);
  } catch (error) {
    console.error('Error during MFA login:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({
      message: error.response ? error.response.data.message : 'Internal Server Error',
    });
  }
});

// New route to initiate SSO
app.post('/initiate-sso', async (req, res) => {
  const { session } = req.body; // Assuming you're sending the session token from the frontend

  if (!session) {
    return res.status(403).json({ message: 'No session provided' });
  }

  try {
    // Verify the session token
    // This step depends on how you're handling sessions. You might need to verify against a database or a JWT.
    const decodedSession = jwt.verify(session, 'your-secret-key'); // Replace with your actual secret key

    // Prepare the data for the SSO request
    const ssoPayload = {
      userId: decodedSession.userId,
      timestamp: new Date().getTime(),
      // Add any other required fields
    };

    // Sign the SSO payload
    const ssoToken = jwt.sign(ssoPayload, 'your-engagementrx-shared-secret', { expiresIn: '1h' });

    // Construct the SSO URL
    const ssoUrl = `https://www.engagementrx.com/sensablehealth/app/sso?token=${ssoToken}`;

    res.json({ ssoUrl });
  } catch (error) {
    console.error('Error initiating SSO:', error);
    res.status(500).json({ message: 'Failed to initiate SSO' });
  }
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint Not Found' });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
