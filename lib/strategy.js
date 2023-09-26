
const { Issuer, Strategy } = require('openid-client');

async function AffinidiStrategy(options = {}) {

  if (typeof options.issuer !== 'string' || !options.issuer) {
    throw new TypeError('affinidi issuer is required');
  }
  if (typeof options.client_id !== 'string' || !options.client_id) {
    throw new TypeError('affinidi client_id is required');
  }
  if (typeof options.client_secret !== 'string' || !options.client_secret) {
    throw new TypeError('affinidi client_secret is required');
  }

  //discover the wellknown for issuer
  const affinidi = await Issuer.discover(options.issuer);
  console.log('Discovered issuer %s %O', affinidi.issuer, affinidi.metadata);

  var client = new affinidi.Client({
    sessionKey: `oidc:${options.id || "affinidi"}-session-key`,
    client_id: options.client_id,
    client_secret: options.client_secret,
    redirect_uris: options.redirect_uris,
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_post',
  });

  const defaultVerifyCallback = (tokenSet, userinfo, done) => {
    return done(null, tokenSet.claims());
  };

  return {
    client,
    strategy: new Strategy({ client, sessionKey: client.sessionKey }, options.verifyCallback || defaultVerifyCallback)
  }

}

module.exports = AffinidiStrategy;

