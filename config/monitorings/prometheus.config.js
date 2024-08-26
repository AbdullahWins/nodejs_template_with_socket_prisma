const prometheus = require("prom-client");

const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status"],
  buckets: [0.1, 0.5, 1, 1.5, 2, 3, 5], // Example buckets, adjust as needed
});

// Enable collection of default metrics like CPU and memory usage
prometheus.collectDefaultMetrics();

// Create a middleware function to collect request duration
function initializeMonitoring(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    httpRequestDurationMicroseconds
      .labels(
        req.method,
        req.route ? req.route.path : req.baseUrl + req.path,
        res.statusCode
      )
      .observe(duration / 1000);
  });
  next();
}

// Expose metrics endpoint for Prometheus to scrape
async function getMetrics(req, res) {
  try {
    const end = httpRequestDurationMicroseconds.startTimer();
    res.on("finish", () => {
      let routePath = req.route ? req.route.path : req.baseUrl + req.path;
      end({
        method: req.method,
        route: routePath || req.url,
        status: res.statusCode,
      });
    });

    const metrics = await prometheus.register.metrics();
    res.set("Content-Type", prometheus.register.contentType);
    res.end(metrics);
  } catch (error) {
    console.error("Error retrieving metrics:", error);
    res.status(500).send("Error retrieving metrics");
  }
}

module.exports = { initializeMonitoring, getMetrics };
