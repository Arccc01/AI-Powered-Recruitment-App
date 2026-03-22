const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  console.error(err.stack);

  // Joi validation errors
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.details.map((d) => d.message),
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  // Default
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

module.exports = { errorHandler, notFound };