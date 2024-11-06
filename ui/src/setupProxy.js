const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config({ path: '../server/.env' });

module.exports = function(app) {
  app.use(
    '/user/signin',
    createProxyMiddleware({
      target: process.env.USER_API_BASE_URL,
      changeOrigin: true,
      secure: true,
      headers: {
        'Content-Type': 'application/json',
      },
      onProxyReq: (proxyReq, req, res) => {
        const auth = Buffer.from(`${req.body.username}:${req.body.password}`).toString('base64');
        proxyReq.setHeader('Authorization', `Basic ${auth}`);
      },
    })
  );

  // Proxy /user/mfalogin
  app.use(
    '/user/mfalogin',
    createProxyMiddleware({
      target: 'https://userapi.qa.sensablehealth.net',
      changeOrigin: true,
      secure: true,
      headers: {
        'Content-Type': 'application/json',
      },
      onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('Authorization', `Bearer ${req.body.session}`);
      },
    })
  );

  // Proxy /proxy-booking
  app.use(
    '/proxy-booking',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
      onProxyRes: function(proxyRes, req, res) {
        // Ensure content type is preserved
        if (proxyRes.headers['content-type']) {
          res.setHeader('Content-Type', proxyRes.headers['content-type']);
        }
      }
    })
  );

  // Add more proxies as needed

  // Add this to your existing proxy configuration
  app.use(
    ['/login', '/login/callback'],
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
      ws: true,
      xfwd: true,
      timeout: 30000, // Add 30 second timeout
      onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('Origin', 'http://localhost:3000');
        proxyReq.setHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9');
        if (req.method === 'POST') {
          proxyReq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
      },
      onProxyRes: (proxyRes, req, res) => {
        proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
      },
      onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(502).json({ message: 'Proxy Error', error: err.message });
      }
    })
  );

  app.use(
    '/aws-sso',
    createProxyMiddleware({
      target: process.env.AWS_SSO_URL,
      changeOrigin: true,
      secure: true,
      pathRewrite: {
        '^/aws-sso': ''
      },
      onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('Origin', process.env.AWS_SSO_URL);
        proxyReq.setHeader('Referer', `${process.env.AWS_SSO_URL}/`);
      },
      onProxyRes: (proxyRes, req, res) => {
        proxyRes.headers['Access-Control-Allow-Origin'] = process.env.CORS_ORIGIN;
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
      }
    })
  );
};