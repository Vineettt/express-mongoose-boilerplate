const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const logger = require("@/shared/common/logger");
const { removeExtension } = require("@/shared/common/string-functions");
const env = process.env.NODE_ENV || "development";
const basename = path.basename(__filename);

const db: any = {};

try {
  const config = require(path.resolve(
    path.join(path.dirname(__dirname), `config/${env}`),
    "config"
  ));
  const databases = Object.keys(config.databases);
  for (let i = 0; i < databases.length; ++i) {
    let database = databases[i];
    let dbPath = config.databases[database];
    const conn = mongoose.createConnection(dbPath.uri);

    conn.on("connected", () => logger.info(`Connected to ${dbPath.database}`));
    db[dbPath?.database] = {
      connection: conn,
      models: {},
    };
  }

  for (let i = 0; i < databases.length; ++i) {
    let database = databases[i].toLowerCase();
    fs.readdirSync(`${__dirname}/${database}`)
      .filter((file: string) => {
        return (
          file.indexOf(".") !== 0 &&
          file !== basename &&
          file.slice(-3) === ".js"
        );
      })
      .forEach(async (file: any) => {
        const modelDef = require(path.join(`${__dirname}/${database}`, file));

        const model = modelDef(db[database]?.connection);
        db[database].models[removeExtension(file)] = model;
      });
  }
} catch (error) {
  logger.error(error);
}

module.exports = db;
