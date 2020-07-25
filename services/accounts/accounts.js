
const express = require('express');
const router = express.Router();

const UserToken = Parse.Object.extend("User_token");

router.post('/login', (req, res) => {
    Parse.User.logIn(req.body.username, req.body.password).then(function(user) {
        req.session.userId = user.id;
        req.session.token = user.getSessionToken();
        return res.status(200).end();

    }).then(null, function(_error) {
        res.clearCookie(process.env.COOKIE_NAME);
        return res.status(403).end();
    });
});

router.post('/logout', (req, res) => {
    const { token } = req.session;

    if (token) {
        Parse._request('POST', 'logout', {
            'X-Parse-Session-Token': token,
        }).then(function (_user) {
            res.clearCookie(process.env.COOKIE_NAME);
            res.clearCookie(`${process.env.COOKIE_NAME}.sig`)
            return res.status(200).end();
        }, function (_error) {
            return res.status(401).end();
        });
    } else {
        return res.status(401).end();
    }
    
});

router.post('/register', async (req, res) => {
    const user = new Parse.User();

    const {username, password, mail, phone} = req.body || {};
    user.set("username", username);
    user.set("password", password);
    user.set("email", mail);

    user.set("phone", phone);
    try {
        await user.signUp();
        console.log('registering user succeeded')
        res.json({});
    } catch (error) {
        console.log('registering user failed')
        res.redirect('/login');
    }

});

router.post('/registerFcmToken', async (req, res) => {
    const { userId, token } = req.session;

    if (token && userId) {
        const { fcmToken } = req.body;

        let userToken = (await new Parse.Query(UserToken).equalTo('userId', userId).find()).shift();
        
        if (!userToken) {
            userToken = new UserToken();
            userToken.set('userId', userId);
        }
        userToken.set('fcmToken', fcmToken);

        userToken.save()
            .then((_userToken) => {
                return res.status(200).end();
            }, (_error) => {
                return res.status(400).end();
            }); 
    } else {
        return res.status(401).end();
    }
});

module.exports = router;