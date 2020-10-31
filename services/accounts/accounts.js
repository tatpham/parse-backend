const express = require("express");
const router = express.Router();

const setSessionCookie = (request, user) => {
  const sessionToken = user.getSessionToken();

  request.session.userId = user.id;
  request.session.token = sessionToken;
};

const getUserByUsername = (username) => {
  const query = new Parse.Query("User");
  query.equalTo("username", username);
  return query.first();
};

router.post("/login", async (req, res) => {
  await Parse.User.logIn(req.body.username, req.body.password)
    .then(function(user) {
      setSessionCookie(req, user);
      return res.status(200).json(user);
    })
    .then(null, function(error) {
      res.clearCookie(process.env.COOKIE_NAME);
      return res.status(400).json(error);
    });
});

router.post("/logout", async (req, res) => {
  const { token } = req.session;

  if (token) {
    await Parse.Cloud.httpRequest({
      url: `${process.env.PARSE_SERVER_URL}/logout`,
      method: "POST",
      headers: {
        "X-Parse-Application-Id": process.env.APP_ID,
        "X-Parse-REST-API-Key": process.env.REST_API_KEY,
        "X-Parse-Session-Token": token,
      },
    }).then(
      function(_user) {
        res.clearCookie(process.env.COOKIE_NAME);
        res.clearCookie(`${process.env.COOKIE_NAME}.sig`);
        return res.status(200).end();
      },
      function(_error) {
        return res.status(401).end();
      }
    );
  } else {
    return res.status(401).end();
  }
});

router.get("/currentuser", async (req, res) => {
  const { token } = req.session;

  if (token) {
    await Parse.Cloud.httpRequest({
      url: `${process.env.PARSE_SERVER_URL}/users/me`,
      headers: {
        "X-Parse-Application-Id": process.env.APP_ID,
        "X-Parse-REST-API-Key": process.env.REST_API_KEY,
        "X-Parse-Session-Token": token,
      },
    }).then(
      function(response) {
        const { objectId, username } = response.data;

        req.session.userId = objectId;
        req.session.token = token;

        return res.status(200).json({
          objectId,
          username,
        });
      },
      function(_error) {
        // The token could not be validated.
        res.clearCookie(process.env.COOKIE_NAME);
        res.clearCookie(`${process.env.COOKIE_NAME}.sig`);

        return res.status(401).end();
      }
    );
  }

  return res.status(401).end();
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (await getUserByUsername(username)) {
    res.status(400).json({ message: "User already exists" });
  } else {
    const user = new Parse.User();
    user.set("username", username);
    user.set("password", password);
    user.set("email", `${username}@example.com`);

    // other fields can be set just like with Parse.Object
    user.set("phone", "415-392-0202");

    try {
      await user.signUp();
      setSessionCookie(req, user);
      res.json(user);
    } catch (error) {
      console.log("registering user failed");
      res.status(400).json(error);
    }
  }
});

module.exports = router;
