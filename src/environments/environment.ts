// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  isStaging: true,
  userURL: 'https://demo.justpruvit.com/',
  checkoutURL: 'https://demo-opc.justpruvit.com/',
  domainPath: 'https://demo.shopketo.com',
  redirectURL: 'https://demo.justpruvit.com',
  clientID: 'pruvitdemoomicronclient',
  returningURL: 'https://account-demo.justpruvit.com/',
  clientDomainURL: 'http://localhost:4200',
  phraseBase: 'https://api.phraseapp.com/api/v2/projects/',
  phraseAppId: 'dec2efdab93d62d55da009cb683a438a',
  phraseAppToken:
    'token 0864c626e7cd21f38c5ecc958c9ab0998fe0a586647f61b2febedfa08ea2808f',
  shaSalt: 'QM=5LGFkAczk',
  foodCheckoutUrl: 'https://demo-opc.justpruvit.com/',
  iaaConfig: {
    stsServer: 'https://account-demo.justpruvit.com',
    redirectUrl: 'http://keto.justpruvit.com:4200/implicit',
    // The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer
    // identified by the iss (issuer) Claim as an audience.
    // The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience,
    // or if it contains additional audiences not trusted by the Client.
    clientId: 'pruvitdemoomicronimpclient',
    responseType: 'id_token token',
    scope: 'openid newgen email phone profile',
    postLogoutRedirectUri: 'http://keto.justpruvit.com:4200',
    startCheckSession: false,
    silentRenew: true,
    silentRenewUrl: 'http://keto.justpruvit.com:4200/silent-renew.html',
    postLoginRoute: '',
    // HTTP 403
    forbiddenRoute: '/unauthorized',
    // HTTP 401
    unauthorizedRoute: '/unauthorized',
    // log_console_warning_active: true,
    // log_console_debug_active: true,
    // id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time,
    // limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
    maxIdTokenIatOffsetAllowedInSeconds: 1000,
    triggerAuthorizationResultEvent: true
  },
  newgenUrl: 'https://demo.justpruvit.com/api'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
