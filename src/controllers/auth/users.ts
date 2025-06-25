import { NextFunction, Request, Response } from "express";
import { HTTPMethod } from "http-method-enum";
import { iResponse } from "../../shared/interfaces/iResponse";

const responseClass = require("@/shared/classes/responseClass");
const db = require("@/models");
const DBs = require("@/shared/constants/dbs-list");
const User = db[DBs?.AUTH?.toLowerCase()]?.models?.user;

const users = async (req: Request, res: Response, next: NextFunction) => {
  let responseObject: iResponse = new responseClass();
  try {
    responseObject.resType = "TRY_BLOCK";
    responseObject.type = "JSON";
    if (req.method === HTTPMethod.POST) {
      const { limit, offset } = req.body;
      let search = req?.body?.search || "";
      const regex = new RegExp(search, "i");
      let users = await User.aggregate([
        {
          $match: {
            email: { $regex: regex },
          },
        },
        {
          $addFields: {
            user_status: {
              $switch: {
                branches: [
                  { case: { $eq: ["$status", -2] }, then: "LOCKED" },
                  { case: { $eq: ["$status", -1] }, then: "PENDING" },
                  { case: { $eq: ["$status", 0] }, then: "ACTIVATE" },
                ],
                default: "UNKNOW",
              },
            },
          },
        },
        {
          $project: {
            reset_token: 0,
            token: 0,
            reset_status: 0,
            created_at: 0,
            deleted_at: 0,
            is_deleted: 0,
            password: 0,
            login_attempts: 0,
            updated_at: 0,
            status: 0,
          },
        },
        { $skip: offset },
        { $limit: limit },
      ]);

      const count = await User.countDocuments({
        email: { $regex: regex },
      });
      responseObject.payload = {
        payload: users,
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

module.exports = users;
