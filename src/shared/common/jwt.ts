const jwt = require("jsonwebtoken");
const generateJwt = async (payload: { email: any; key: any; role: any; }, secret_key: any, expiresIn: any) => {
  return await jwt.sign(payload, secret_key, { expiresIn: expiresIn });
};

const verifyJwt = async (token: any, secret_key: any) => {
  return await jwt.verify(token, secret_key);
};

module.exports = { generateJwt, verifyJwt };
