const bcrypt = require("bcryptjs");

const hashString = async (text: string) => {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(text, salt);
};

const hashCompare = async (
  text: string,
  hash: (password: any, password1: any) => void
) => {
  return await bcrypt.compare(text, hash);
};

module.exports = {hashCompare, hashString};
