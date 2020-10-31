# iuvivoweb-backend

## Setup environment

1. Create .env file in root directory
2. Add the following variables

| Variable name | Value |
| ------ | ------ |
| EXPRESS_PORT | 5000 |
| DATABASE_URI | mongodb://localhost:27017/dev (connection string for your MongoDB database) |
| APP_ID | myAppId |
| MASTER_KEY | myMasterKey |
| REST_API_KEY | myRestApiKey |
| PARSE_SERVER_URL | http://localhost:${port}/parse |
| COOKIE_NAME | myCookieName |
| COOKIE_SECRET | myCookieSecret |
| PARSE_SERVER_SESSION_LENGTH | 1337 |
| CLOUD_CODE_MAIN | myPathToCloudCodeFile |
| PATH_CERTIFICATE_KEY | pathToKey |
| PATH_CERTIFICATE_CERT | pathToCertificate |
| PASSPHRASE_CERTIFICATE | myPassphrase |
| PATH_STATIC_FILES | relativePathToStaticContent |

3. Replace secrets accordingly
