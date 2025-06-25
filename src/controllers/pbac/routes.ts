import { NextFunction, Request, Response } from "express";
import { HTTPMethod } from "http-method-enum";
import { iResponse } from "../../shared/interfaces/iResponse";
const responseClass = require("@/shared/classes/responseClass");
const db = require("@/models");
const DBs = require("@/shared/constants/dbs-list");

const Routes = db[DBs?.PBAC?.toLowerCase()]?.models?.routes;

const login = async (req: Request, res: Response, next: NextFunction) => {
  let responseObject: iResponse = new responseClass();
  try {
    responseObject.resType = "TRY_BLOCK";
    responseObject.type = "JSON";
    if (req.method === HTTPMethod.POST) {
      const { limit, offset } = req?.body;
      let search = req?.body?.search || "";
      const regex = new RegExp(search, "i"); // case-insensitive partial match

      const routes = await Routes.find({ endpoint: regex })
        .skip(offset)
        .limit(limit)
        .select("-_id -__v")
        .lean();

      const count = await Routes.countDocuments({
        endpoint: { $regex: search, $options: "i" }, // 'i' for case-insensitive
      });
      responseObject.payload = {
        payload: routes,
        length: count,
      };
      responseObject.messageKey = "SUCCESSFULLY_FETCHED";
      next(responseObject);
    }
  } catch (error) {
    responseObject.resType = "CATCH_BLOCK";
    responseObject.type = "JSON";
    responseObject.payload = error;
    next(responseObject);
  }
};

module.exports = login;
