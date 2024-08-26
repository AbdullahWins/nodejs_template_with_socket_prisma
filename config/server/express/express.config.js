const express = require("express");
const { initializeCors } = require("../../cors/cors.config");
const { initializeMulter } = require("../../multer/multer.config");
const { initializeHelmet } = require("../../helmet/helmet.config");
const { initializeMonitoring } = require("../../monitorings/prometheus.config");

const { MainRouter } = require("../../../src/routes/Main/MainRouter");
const {
  globalErrorHandler,
} = require("../../../src/services/responseHandlers/HandleResponse");

const configureApp = (server) => {
  // Initialize Express app
  const app = express();

  // Middleware for parsing URL-encoded bodies
  app.use(express.urlencoded({ extended: true }));

  // Middleware to collect request duration
  app.use(initializeMonitoring);

  // Initialize helmet
  initializeHelmet(app);

  // Initialize CORS
  initializeCors(app);

  // Initialize Multer
  initializeMulter(app);

  // Routes
  app.use(MainRouter);

  // Global Error Handling Middleware
  app.use(globalErrorHandler);

  return app;
};

module.exports = { configureApp };
