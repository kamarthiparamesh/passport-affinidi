# passport-affinidi

Passport strategy for authenticating with Affinidi using OAuth 2.0 Code-Grant flow.

This module lets you authenticate using Affinidi in your Node.js applications. By plugging into Passport, `Affinidi Login` can be easily and unobtrusively integrated into any application or framework that supports Connect-style middleware, including Express.

This provider creates Affinidi openid client and registers below 2 routes

1. The first GET route (default as `/api/affinidi-auth/init`) - which returns the affinidi authorization URL for the user to redirect to Affinidi Login flow
2. The second POST route (default as `/api/affinidi-auth/complete`) - which processes the response(code, state) from Affinidi and does exchange for ID Token and returns user profile

## Install

```
npm install passport-affinidi
```

## Usage

1. Import the affinidi provider

```
const affinidiProvider = require('passport-affinidi')
```

2. Initialize the provider by passing express server and options with issuer, client id, secret etc..

```
 await affinidiProvider(app, {
        id: "affinidi",
        issuer: process.env.AFFINIDI_ISSUER,
        client_id: process.env.AFFINIDI_CLIENT_ID,
        client_secret: process.env.AFFINIDI_CLIENT_SECRET,
        redirect_uris: ['http://localhost:3000/auth/callback']
    });
```

## Example express server with passport-affinidi

```
var express = require('express');
require('dotenv').config()

const affinidiProvider = require('passport-affinidi')

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3001;

const initializeServer = async () => {

    app.get('/', function (req, res, next) {
        res.json({ success: 'Express' });
    });

    await affinidiProvider(app, {
        id: "affinidi",
        issuer: process.env.AFFINIDI_ISSUER,
        client_id: process.env.AFFINIDI_CLIENT_ID,
        client_secret: process.env.AFFINIDI_CLIENT_SECRET,
        redirect_uris: ['http://localhost:3000/auth/callback'],
        expressSesssion: {
            session_secret: "express session secret key",
        },
        routes: {
            init: '/api/affinidi-auth/init',
            complete: '/api/affinidi-auth/complete'
        },
        verifyCallback: (tokenSet, userinfo, done) => {
            console.log('verify callback', tokenSet, userinfo);
            return done(null, tokenSet.claims());
        },
        onSuccess: (user, profile) => {
            console.log('success', profile);
        },
        onError: (err) => {
            console.log('error', err);
        },
    });

    app.listen(PORT, () => {
        console.log(`Server listening on ${PORT}`);
    });

}

initializeServer();

```

## Affinidi Code Grant flow from any frontend

1. Initiate the Affinidi flow

```
      const res = await fetch(`/api/affinidi-auth/init`, {
        method: "get",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      window.location.href = data.authorizationUrl;
```

2. Complete the Affinidi flow from callback url and get user profile/error

```
      const code = "ory_ac_cpJavrZRCrcF1OgbOhSCTlaTwjEWCEArHKrUsLDKGnU.Nsfxhk7IGJ9ePGEMtCS3-Vy78-KGpX4QPRWWL8CBiDg" // get from querystring name "code"
      const state = "YvK_vGNLUYXF96wnd-wHfzZ2klAPu0Y_X5zoHfsXRk4" // get from querystring name "state"
      const res = await fetch(`/api/affinidi-auth/complete`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, state }),
      });

      const response = await res.json();
      if (response.error) {
        console.log('error', `${response.error}-${response.error_description}`)
      } else {
        console.log('success', response.user)
      }
```
