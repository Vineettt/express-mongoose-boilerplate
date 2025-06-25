import { NextFunction, Request, Response } from "express";
import { HTTPMethod } from "http-method-enum";
import { iResponse } from "../../shared/interfaces/iResponse";

const responseClass = require("@/shared/classes/responseClass");
const db = require("@/models");
const DBs = require("@/shared/constants/dbs-list");
const Role = db[DBs?.PBAC?.toLowerCase()]?.models?.roles;

const login = async (req: Request, res: Response, next: NextFunction) => {
  let responseObject: iResponse = new responseClass();
  try {
    responseObject.resType = "TRY_BLOCK";
    responseObject.type = "JSON";
    if (req.method === HTTPMethod.POST) {
      const { limit, offset } = req.body;
      let search = req?.body?.search || "";

      const regex = new RegExp(search, "i"); 

      let role = await Role.find({ role: regex })
        .skip(offset)
        .limit(limit)
        .select('-_id -__v')
        .lean();

      const count = await Role.countDocuments({
        role: { $regex: search, $options: "i" },
      });
      responseObject.payload = {
        payload: role,
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
