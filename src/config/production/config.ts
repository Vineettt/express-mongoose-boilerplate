import config from "../index";
const { dbVariables } = config();

module.exports = {
  databases: {
    Auth: {
      database: dbVariables.dbAuthName,
      uri: dbVariables.dbAuthUri,
      parser: dbVariables.dbAuthParser,
      topology: dbVariables.dbAuthTopology,
    },
    Pbac: {
      database: dbVariables.dbPbacName,
      uri: dbVariables.dbPbacUri,
      parser: dbVariables.dbPbacParser,
      topology: dbVariables.dbPbacTopology,
    },
  },
};
