const allowedOrigins = require("../config/allowedOrigins");
// 'Access-Control-Allow-Origin' header needs to be present on the requested resource for cors
const credentials = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", true);
  }
  next();
};

module.exports = credentials;
