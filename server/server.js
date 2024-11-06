// backend/server.js
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const axios = require('axios');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cheerio = require('cheerio');
const passport = require('passport');
const { samlStrategy, samlConfig } = require('./passportConfig');

const app = express();
const PORT = process.env.PORT || 8000;

// Session middleware must be used before passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((user, done) => {
  done(null, user);
});

app.post('/user/signin', async (req, res) => {
  const { username, password, portal } = req.body;
  console.log('Received /signin request:', { username, portal });

  try {
    const response = await axios.post(
      'https://userapi.qa.sensablehealth.net/user/signin',
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

app.post('/user/mfalogin', async (req, res) => {
  const { mfaCode, portal, session, userId } = req.body;
  console.log('Received /mfalogin request:', { mfaCode, portal, userId });

  if (!session) {
    return res.status(403).json({ message: 'No session provided' });
  }

  try {
    const response = await axios.post(
      'https://userapi.qa.sensablehealth.net/user/mfalogin',
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

app.get('/proxy-asset/*', async (req, res) => {
  try {
    const assetPath = req.params[0];
    const response = await axios.get(`${baseUrl}/${assetPath}`, {
      responseType: 'stream',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    // Forward the content type
    res.set('Content-Type', response.headers['content-type']);

    // Pipe the response
    response.data.pipe(res);
  } catch (error) {
    console.error('Asset proxy error:', error);
    res.status(500).send('Error loading asset');
  }
});

app.get('/api/portal/state', (req, res) => {
  res.json({
    status: 'active',
    portal: {
      name: 'sensablehealth',
      settings: {
        // Add any required portal settings
      }
    },
    user: {
      // Add mock user data
    }
  });
});

app.get('/api/environment', (req, res) => {
  res.json({
    apiUrl: 'https://www.engagementrx.com',
    environment: 'development'
  });
});

app.post('/initiate-sso', async (req, res) => {
  console.log('Received SSO initiation request with body:', req.body);
  const { session, portal, relayState } = req.body;
  
  if (!session) {
    console.log('No session token provided in request');
    return res.status(401).json({ message: 'No session token provided' });
  }

  try {
    console.log('Attempting to decode session token');
    // Verify the token
    const decodedToken = jwt.decode(session);
    if (!decodedToken) {
      console.log('Failed to decode token');
      throw new Error('Invalid token format');
    }
    console.log('Successfully decoded token:', decodedToken);

    // Construct the AWS IAM Identity Center SSO URL
    console.log('Constructing SSO URL with base:', process.env.AWS_SSO_URL);
    const ssoUrl = new URL(process.env.AWS_SSO_URL);
    
    // Add required parameters for IdP-initiated flow
    console.log('Adding RelayState parameter:', relayState);
    ssoUrl.searchParams.append('RelayState', relayState);

    const samlPayload = {
      userId: decodedToken.sub,
      email: decodedToken.email,
      portal: portal
    };
    console.log('Creating SAML payload:', samlPayload);
    ssoUrl.searchParams.append('SAMLRequest', Buffer.from(JSON.stringify(samlPayload)).toString('base64'));

    const finalUrl = ssoUrl.toString();
    console.log('Generated final SSO URL:', finalUrl);
    res.json({
      redirectUrl: finalUrl
    });

  } catch (error) {
    console.error('SSO initiation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
});



app.get('/login', passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }), (req, res) => {
  res.redirect('/');
});

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint Not Found' });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
