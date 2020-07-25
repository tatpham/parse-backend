require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});

const express = require('express');
const path = require('path');
// const https = require('https');
const fs = require('fs');
const cookieSession = require('cookie-session');
const ParseServer = require('parse-server').ParseServer;

const accounts = require('./services/accounts/accounts');
const messages = require('./services/notifications/messages');

const authMiddleware = require('./middleware/authentication/auth');

console.log(`Running server in ${process.env.NODE_ENV} mode`);
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
        classNames: [
            'Goal',
        ],
    },
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

// Add authentication middleware
app.use(authMiddleware);

// Authentication URL
app.use('/accounts', accounts);

// Notifications URL
app.use('/notifications', messages);

app.use('/test', (req, res) => {
    res.json({status: 200});
});

// Serve static content in production
if (process.env.NODE_ENV === 'production') {

    // Serve the static files from the React app
    app.use(express.static(path.join(__dirname, '../iuvivo-frontend')));

    // Handle any requests that don't match the ones above
    app.get('*', (_req, res) => {
        res.sendFile(path.resolve(__dirname, '../iuvivo-frontend', 'index.html'));
    });
}

// Enable SSL
// const key = fs.readFileSync(__dirname + '/../certs/selfsigned.key');
// const cert = fs.readFileSync(__dirname + '/../certs/selfsigned.crt');
// const options = {
//     key: key,
//     cert: cert
// };
//
// const server = https.createServer(options, app);

const httpServer = require('http').createServer(app);
httpServer.listen(port);
ParseServer.createLiveQueryServer(httpServer);

console.log(`Listening on port ${port}`)
