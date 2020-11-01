require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
});

const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs');
const cookieSession = require('cookie-session');
const ParseServer = require('parse-server').ParseServer;

const accounts = require('./services/accounts/accounts');
const messages = require('./services/notifications/messages');

const authMiddleware = require('./middleware/authentication/auth');

console.info(`Running server in ${process.env.NODE_ENV} mode`);
const app = express();
const port = process.env.EXPRESS_PORT || 5000;

const api = new ParseServer({
    databaseURI: process.env.DATABASE_URI,
    appId: process.env.APP_ID,
    masterKey: process.env.MASTER_KEY,
    restAPIKey: process.env.REST_API_KEY,
    javascriptKey: process.env.REST_API_KEY,
    serverURL: process.env.PARSE_SERVER_URL,
    sessionLength: process.env.PARSE_SERVER_SESSION_LENGTH,
    cloud: __dirname + process.env.CLOUD_CODE_MAIN,
    liveQuery: {
        classNames: [],
    },
});

// enable cors only for whitelisted origin
app.use(function(_req, res, next) {
  res.header("Access-Control-Allow-Origin", process.env.WHITELISTED_CROSS_ORIGIN);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Serve the Parse API on the /parse URL prefix
app.use('/parse', api);

// Parse JSON bodies
app.use(express.json());

app.use(cookieSession({
    name: process.env.COOKIE_NAME,
    secret: process.env.COOKIE_SECRET,
    maxAge: 2 * 60 * 60 * 1000,
    sameSite: 'strict',
    httpOnly: true,
}));

app.use(express.static(path.join(__dirname, process.env.PATH_STATIC_FILES)));

// Add authentication middleware
app.use(authMiddleware);

// Authentication URL
app.use('/accounts', accounts);

// Notifications URL
app.use('/notifications', messages);

// Handle any requests that don't match the ones above
app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, process.env.PATH_STATIC_FILES, 'index.html'));
});

// Enable SSL
const options = {
    key: fs.readFileSync(__dirname + process.env.PATH_CERTIFICATE_KEY),
    cert: fs.readFileSync(__dirname + process.env.PATH_CERTIFICATE_CERT),
    passphrase: process.env.PASSPHRASE_CERTIFICATE,
};
const server = https.createServer(options, app);

server.listen(port);
ParseServer.createLiveQueryServer(server);
