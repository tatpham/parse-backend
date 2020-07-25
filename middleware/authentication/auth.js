require('../../utils/init');

const userRoutes = [
    '/accounts/login',
    '/accounts/logout',
    '/accounts/register',
    '/parse/login',
    '/parse/logout',
    '/parse/users/me',
];

const authenticate = (req, res, next) => {
    if (userRoutes.indexOf(req.path) > -1) {
        next();
    } else {
        const token = req.session.token;

        if (!token) {
            return res.status(401).json({
                message: 'Unauthorized: No token provided'
            });
        } else {
            Parse._request('GET', 'users/me', {}, {sessionToken: token})
            .then(function (_user) {
                next();
            }, function (_error) {
                // The token could not be validated.
                res.clearCookie(process.env.COOKIE_NAME);
                res.clearCookie(`${process.env.COOKIE_NAME}.sig`)
                return res.status(401).json({
                    message: 'Unauthorized: invalid token'
                });
            });
        }
    }
};

module.exports = authenticate;
