const { initRouteListAndSync } = require("./database-route-sync");
const handlerMapping = require("@/shared/constants/handler-mapping");
const logger = require("@/shared/common/logger");
const router = require("express").Router();
const path = require("path");
const DBs = require("@/shared/constants/dbs-list");
const db = require("@/models");
const Routes = db[DBs?.PBAC?.toLowerCase()]?.models?.routes;

const loadRouter = async (app: any) => {
  try {
    const controllersDir = path.join(path.dirname(__dirname), "controllers");

    await initRouteListAndSync(controllersDir);
    let routeList = await Routes.find();

    routeList.forEach(
      (config: {
        method: string | number;
        endpoint: any;
        handler: any;
        type: any;
      }) => {
        let handlerKey = config.handler || "null_handler";
        router[config.method](
          `${config.endpoint}`,
          handlerMapping[handlerKey],
          require(`${controllersDir}\\${config.type}${config.endpoint}`)
        );
      }
    );
    app.use("/api/", router);
  } catch (error) {
    logger.error(error);
  }
};

module.exports = loadRouter;
