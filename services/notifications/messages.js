const admin = require('firebase-admin');
var serviceAccount = require(process.env.SERVICE_ACCOUNT_FILE);

const express = require('express');
const router = express.Router();

const UserToken = Parse.Object.extend("User_token");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FCM_DATABASE_URL,
});

router.post('/sendMessage', async (req, res) => {
    const { sendToUserId, messageText } = req.body;
    
    const sendToUserToken = (await new Parse.Query(UserToken).equalTo('userId', sendToUserId).find()).shift();
        
    if (sendToUserToken) {
        const message = {
            data: {
              message: messageText,
            },
            token: sendToUserToken.get('fcmToken'),
        };
        admin
            .messaging()
            .send(message)
            .then((response) => {
                // Response is a message ID string.
                console.log('Successfully sent message:', response);

                return response;
            })
            .catch((error) => {
                console.log('Error sending message:', error);
                return error;
            });
    }
    res.status(200).send('Hello from Firebase!');
});

module.exports = router;