const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const generateAccessToken = (userId) => {
  const tokenLifetime = "15m"; // Short-lived access token
  const token = jwt.sign({ _id: userId }, JWT_SECRET, {
    expiresIn: tokenLifetime,
  });

  const decoded = jwt.decode(token);
  console.log(`Access Token generated for user ${userId}:`);
  console.log(`Issue time: ${new Date(decoded.iat * 1000).toISOString()}`);
  console.log(`Expiration time: ${new Date(decoded.exp * 1000).toISOString()}`);

  return token;
};

const generateRefreshToken = (userId) => {
  const tokenLifetime = "7d"; // Longer-lived refresh token
  const token = jwt.sign({ _id: userId }, JWT_SECRET, {
    expiresIn: tokenLifetime,
  });

  const decoded = jwt.decode(token);
  console.log(`Refresh Token generated for user ${userId}:`);
  console.log(`Issue time: ${new Date(decoded.iat * 1000).toISOString()}`);
  console.log(`Expiration time: ${new Date(decoded.exp * 1000).toISOString()}`);

  return token;
};

module.exports = { generateAccessToken, generateRefreshToken };
