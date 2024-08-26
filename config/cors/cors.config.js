//cors config
const cors = require("cors");
const {
  CustomError,
} = require("../../src/services/responseHandlers/HandleResponse");
const { logger } = require("../../src/services/logHandlers/HandleWinston");

const allowedOrigins = [
  //for development
  "http://localhost:3000",

  //ip address
  "http://127.0.0.1:3000",

  //for deployment
];

const corsOptions = {
  origin: function (origin, callback) {
    logger.log("silly", `Request Origin: ${origin}`);
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      logger.log("silly", "Request has been allowed by CORS");
      callback(null, true);
    } else {
      callback(new CustomError(403, "Request has not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

//with configuration
const initializeCors = (app) => {
  app.use(cors(corsOptions));
  //pre-flight request
  app.options("*", cors(corsOptions));
};

//without any configuration
// const initializeCors = (app) => {
//   app.use(cors());
// };

module.exports = { allowedOrigins, initializeCors };
