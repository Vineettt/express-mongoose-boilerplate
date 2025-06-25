const DBs = require("@/shared/constants/dbs-list");
const path = require("path");
const env = process.env.NODE_ENV || "development";

export const fetchAllDbName =  () => {
  const dbNameMapping: any = {};
  const config = require(path.resolve(
    path.join(path.dirname(__dirname), `config/${env}`),
    "config"
  ));
  if (Object?.keys(config)?.length === 0) {
    return dbNameMapping;
  }

  for (let [key, value] of Object.entries(DBs)) {
    let dName: any = value;
    dbNameMapping[key] = config.databases[dName]?.database;
  }
  return dbNameMapping;
};
