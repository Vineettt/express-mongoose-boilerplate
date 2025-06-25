import { NextFunction, Request, Response } from "express";
import config from "../../config/index";

const { prompts } = config();
const handlerMapping = require("@/shared/constants/handler-mapping");
const logger = require("@/shared/common/logger");
const db = require("@/models");
const DBs = require("@/shared/constants/dbs-list");
const Routes = db[DBs?.PBAC?.toLowerCase()]?.models?.routes;
const { StatusCode } = require("status-code-enum");

const handlerChecker = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const lang: any = req.headers["accept-language"] || "eu";
  try {
    let urlArray: any[] = req.url.split("/");
    urlArray.splice(1, 1);
    let endpoint: string = urlArray.join("/");
    const route = await Routes.findOne({
      where: {
        endpoint: endpoint,
        method: req.method.toLowerCase(),
      },
    });

    if (
      route &&
      (route.handler === null || handlerMapping[route.handler] === undefined)
    ) {
      return res.status(StatusCode?.ClientErrorNotFound).json({
        errors: { message: prompts[lang]["ROLE_ROUTE_MAPPING_MISSING"] },
      });
    } else {
      next();
    }
  } catch (error) {
    logger.error(`Check Handler ${error}`);
    res
      .status(StatusCode?.ServerErrorInternal)
      .json({ errors: { message: prompts[lang]["SERVER_SIDE_WRONG"] } });
  }
};

module.exports = handlerChecker;
