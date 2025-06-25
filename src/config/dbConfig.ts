const DBs = require("@/shared/constants/dbs-list")

export const fetchAllDbConfig = () => {
  const dbVariables: any = {};
  for (let [key, value] of Object.entries(DBs)) {
    dbVariables[`db${value}Name`] = process.env[`DB_${key}_NAME`] || "";
    dbVariables[`db${value}Uri`] = process.env[`DB_${key}_URI`] || "";
    dbVariables[`db${value}Parser`] = process.env[`DB_${key}_PARSER`] || "";
    dbVariables[`db${value}Topology`] = process.env[`DB_${key}_TOPOLOGY`] || "";
  }
  return dbVariables;
};
