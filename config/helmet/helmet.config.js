// helmetConfig.js
const helmet = require("helmet");

const initializeHelmet = (app) => {
  // Set various security-related HTTP headers
  app.use(
    helmet(
      //cors
      {
        contentSecurityPolicy: false,
      }
    )
  );

  // Set Content Security Policy (CSP)
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        imgSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'", "https:", "'unsafe-inline'"],
        upgradeInsecureRequests: [],
      },
    })
  );

  // Set Referrer Policy
  app.use(helmet.referrerPolicy({ policy: "no-referrer" }));

  // Set X-XSS-Protection Policy
  app.use(
    helmet({
      xXssProtection: true,
    })
  );

  return app;
};

module.exports = { initializeHelmet };
