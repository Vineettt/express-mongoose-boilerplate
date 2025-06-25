import express, { Express, Request, Response } from "express";

const app: Express = express();
const maintenance = require("@/shared/middleware/maintenance");
const handlerChecker = require("@/shared/middleware/handler-checker")
const responseHandler = require("@/shared/middleware/response-handler");
const port = process.env.PORT || 3000;
const db = require("@/models/index");
const DBs = require("@/shared/constants/dbs-list");

const logger = require("@/shared/common/logger");
const syncTemplatesFolder = require("@/shared/email/sync-templates-folder");
const loadRouter = require("./routes/index.route");
const cors = require('cors');
const Role = db[DBs?.PBAC?.toLowerCase()]?.models?.roles;

Role.updateRolesTable();

syncTemplatesFolder();

app.use(cors());

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

async function loadRoutes() {
  app.use(maintenance);
  // app.use(handlerChecker);
  await loadRouter(app);
  app.use(responseHandler);
}

loadRoutes().then(() => {
  app.listen(port, () => {
    logger.info(`[server]: Server is running at http://localhost:${port}`);
  });
});