// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/user/signin',
    createProxyMiddleware({
      target: 'https://userapi.sensablehealth.net',
      changeOrigin: true,
      secure: true, // Set to false if the target is using self-signed certificates
      headers: {
        'Content-Type': 'application/json',
      },
      onProxyReq: (proxyReq, req, res) => {
        // Add custom headers if needed
        // For example, set Authorization header
        const auth = Buffer.from(`${req.body.username}:${req.body.password}`).toString('base64');
        proxyReq.setHeader('Authorization', `Basic ${auth}`);
      },
    })
  );

  // Proxy other endpoints as needed
};
