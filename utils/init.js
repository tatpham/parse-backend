const Parse = require('parse/node');

Parse.initialize(process.env.APP_ID, process.env.REST_API_KEY);
Parse.serverURL = process.env.PARSE_SERVER_URL;

module.exports={
    Parse,
};
