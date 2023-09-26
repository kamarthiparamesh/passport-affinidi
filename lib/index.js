const passport = require('passport');
const expressSesssion = require('express-session');

const AffinidiStrategy = require('./strategy');
const { profileParser } = require('./profile');
const { generators } = require('openid-client');

const affinidiProvider = async (app, options = {}) => {

    const { client, strategy } = await AffinidiStrategy(options);

    passport.use('affinidi-oidc', strategy);

    // app.use(passport.initialize());
    // app.use(passport.session());

    app.use(
        expressSesssion({
            secret: 'this is session secret',
            resave: false,
            saveUninitialized: true,
            unset: 'destroy',
            ...options.expressSesssion,
        })
    );

    // handles serialization and deserialization of authenticated user
    // passport.serializeUser(function (user, done) {
    //     done(null, user);
    // });
    // passport.deserializeUser(function (user, done) {
    //     done(null, user);
    // });


    const initHandler = (req, res, next) => {
        const code_verifier = generators.codeVerifier();
        const params = {
            code_challenge: generators.codeChallenge(code_verifier),
            code_challenge_method: 'S256',
            response_type: 'code',
            scope: 'openid',
            state: generators.state()
        };
        req.session[client.sessionKey] = { state: params.state, response_type: params.response_type, code_verifier };

        let authorizationUrl = client.authorizationUrl(params);
        res.send({ authorizationUrl });
    }

    const completeHandler = (req, res, next) => {
        passport.authenticate('affinidi-oidc', {}, function (err, user, info) {
            if (err) {
                if (options.onError && typeof options.onError === 'function') {
                    options.onError(err)
                }
                res.status(400).send({ error: err.message, error_description: err.error_description });
            }
            else {
                const profile = profileParser(user);
                if (options.onSuccess && typeof options.onSuccess === 'function') {
                    options.onSuccess(user, profile)
                }
                res.send({ user: profile });
            }

        })(req, res, next);
    }

    app.get(options.routes?.init || '/api/affinidi-auth/init', initHandler);

    app.post(options.routes?.complete || '/api/affinidi-auth/complete', completeHandler);

}


module.exports = affinidiProvider

exports.AffinidiProvider = affinidiProvider;
