import { NextFunction, Request, Response } from "express";
import { HTTPMethod } from "http-method-enum";
import { iResponse } from "../../shared/interfaces/iResponse";

const responseClass = require("@/shared/classes/responseClass");
const executeQuery = require("@/shared/common/execute-query");
const queryParams = require("@/shared/classes/queryParams");
const db = require("@/models");
const DBs = require("@/shared/constants/dbs-list");
const RRMapping = db[DBs?.PBAC?.toLowerCase()]?.models?.role_route_mappings;
const Role = db[DBs?.PBAC?.toLowerCase()]?.models?.roles;
const Routes = db[DBs?.PBAC?.toLowerCase()]?.models?.routes;

const roleRouteMapping = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let responseObject: iResponse = new responseClass();
  try {
    responseObject.resType = "TRY_BLOCK";
    responseObject.type = "JSON";
    if (req.method === HTTPMethod.POST) {
      const { limit, offset } = req.body;

      let role = req?.body?.role || "";
      let search = req?.body?.search || "";

      const pipeline = [
        {
          $lookup: {
            from: "routes",
            localField: "route_fk_id",
            foreignField: "id",
            as: "route",
          },
        },
        {
          $unwind: "$route",
        },
        {
          $lookup: {
            from: "roles",
            localField: "role_fk_id",
            foreignField: "id",
            as: "role",
          },
        },
        {
          $unwind: "$role",
        },
        {
          $match: {
            "role.id": { $regex: role, $options: "i" },
            "route.endpoint": { $regex: search, $options: "i" },
          },
        },
        {
          $project: {
            _id: 0,
            id: 1, // rrm.id
            endpoint: "$route.endpoint",
            method: "$route.method",
            handler: "$route.handler",
            role: "$role.role",
          },
        },
        {
          $skip: offset,
        },
        {
          $limit: limit,
        },
      ];

      let payload = await RRMapping.aggregate(pipeline);

      const countPipeline = [
        {
          $lookup: {
            from: "routes",
            localField: "route_fk_id",
            foreignField: "id",
            as: "route",
          },
        },
        { $unwind: "$route" },
        {
          $lookup: {
            from: "roles",
            localField: "role_fk_id",
            foreignField: "id",
            as: "role",
          },
        },
        { $unwind: "$role" },
        {
          $match: {
            "role.id": { $regex: role, $options: "i" },
            "route.endpoint": { $regex: search, $options: "i" },
          },
        },
        {
          $count: "count",
        },
      ];

      let count = await RRMapping.aggregate(countPipeline);

      responseObject.payload = {
        payload,
        length: count[0]?.count || 0
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

module.exports = roleRouteMapping;
