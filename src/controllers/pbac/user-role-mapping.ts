import { NextFunction, Request, Response } from "express";
import { HTTPMethod } from "http-method-enum";
import { iResponse } from "../../shared/interfaces/iResponse";

const {
  checkArrayExist,
  checkArrObjectMissingKeys,
  getUniqueArrayObjectKey,
  getArrayOfObjectIndex,
  onlyInLeft,
} = require("@/shared/common/array-functions");
const { stringUndefined } = require("@/shared/common/string-functions");
const customErrorClass = require("@/shared/classes/customErrorClass");
const responseClass = require("@/shared/classes/responseClass");
const db = require("@/models");
const DBs = require("@/shared/constants/dbs-list");
const User = db[DBs?.AUTH?.toLowerCase()]?.models?.user;
const Role = db[DBs?.PBAC?.toLowerCase()]?.models?.roles;
const URMapping = db[DBs?.PBAC?.toLowerCase()]?.models?.user_role_mappings;

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
            first_name: 0,
            last_name: 0,
            user_status: 0,
            __v: 0,
            _id: 0,
          },
        },
        { $skip: offset },
        { $limit: limit },
      ]);

      let uniqueIDS = getUniqueArrayObjectKey(users, ["id"]);

      let roleUserArray = await URMapping.aggregate([
        {
          $match: {
            user_fk_id: { $in: uniqueIDS },
          },
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
          $unwind: {
            path: "$role",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: "$user_fk_id",
            roles: {
              $push: {
                id: "$role.id",
                role: "$role.role",
              },
            },
          },
        },
        {
          $project: {
            user_fk_id: "$_id",
            roles: 1,
            _id: 0,
          },
        },
      ]);

      let payload: any = [];
      for (const row of roleUserArray) {
        let fIndex = await getArrayOfObjectIndex(users, row.user_fk_id, "id");
        let roleArray = Array.isArray(row?.roles) ? row?.roles : [row?.roles];
        let uniqueRoles = getUniqueArrayObjectKey(roleArray, ["role"]);
        let tempObject = {
          us_fk_id: row.user_fk_id,
          email: users?.[fIndex]?.email,
          roles: uniqueRoles?.join(","),
        };
        payload.push(tempObject);
      }

      const count = await User.countDocuments({
        email: { $regex: regex },
      });

      responseObject.payload = {
        payload,
        length: count,
        roleUserArray,
      };

      responseObject.messageKey = "SUCCESSFULLY_FETCHED";
      next(responseObject);
    }
    if (req.method === HTTPMethod.PUT) {
      let { mapping, IGNORE_KEY } = req.body;
      let iKExist = await stringUndefined(
        IGNORE_KEY,
        "EDIT_USER_ROLEE_MAPPING"
      );
      if (!iKExist?.status) {
        responseObject.resType = "WARNING_BLOCK";
        responseObject.type = "JSON";
        responseObject.payload = new customErrorClass(
          iKExist.messageKey,
          "REP_STRING",
          ["edit", ""],
          "EDIT_USER_ROLEE_MAPPING"
        );
        next(responseObject);
        return;
      }

      let cAExist = await checkArrayExist(mapping);
      if (!cAExist?.status) {
        throw new customErrorClass(
          cAExist.messageKey,
          "REP_STRING",
          ["Mapping"],
          "mapping"
        );
      }
      let CAOMKeys = await checkArrObjectMissingKeys(mapping, [
        "role_fk_id",
        "user_fk_id",
      ]);
      if (!CAOMKeys?.status) {
        throw new customErrorClass(
          CAOMKeys.messageKey,
          "REP_STRING",
          ["Routes", CAOMKeys?.missingKeys?.join(",")],
          "mapping"
        );
      }

      const uniqueArrayUser = getUniqueArrayObjectKey(mapping, ["user_fk_id"]);
      const uniqueArrayRole = getUniqueArrayObjectKey(mapping, ["role_fk_id"]);

      const countUser = await User.countDocuments({
        id: { $in: uniqueArrayUser },
      });

      if (uniqueArrayUser.length !== countUser) {
        throw new customErrorClass(
          "REP_DOES_NOT_EXIST",
          "REP_STRING",
          ["Users"],
          "mapping"
        );
      }

      const countRole = await Role.countDocuments({
        id: { $in: uniqueArrayRole },
      });

      if (uniqueArrayRole.length !== countRole) {
        throw new customErrorClass(
          "REP_DOES_NOT_EXIST",
          "REP_STRING",
          ["Roles"],
          "mapping"
        );
      }

      const uRMList = await URMapping.find({
        user_fk_id: { $in: uniqueArrayUser },
      });

      const insertAO = await onlyInLeft(mapping, uRMList, isMapping);
      const deleteAO = await onlyInLeft(uRMList, mapping, isMapping);

      if (insertAO.length > 0) {
        const docs = insertAO.map((data: any) => new URMapping(data));
        for (const doc of docs) {
          await doc.validate();
        }
        await URMapping.insertMany(docs, { ordered: false });
      }

      if (deleteAO.length > 0) {
        const uniqueArrayDeleteList = await getUniqueArrayObjectKey(deleteAO, [
          "id",
        ]);

        await URMapping.deleteMany({
          id: { $in: uniqueArrayDeleteList },
        });
      }

      responseObject.messageKey = "SUCCESSFULLY_UPDATED";
      next(responseObject);
    }
  } catch (error) {
    responseObject.resType = "CATCH_BLOCK";
    responseObject.type = "JSON";
    responseObject.payload = error;
    next(responseObject);
  }
};

const isMapping = (
  a: {
    user_fk_id: any;
    role_fk_id: any;
  },
  b: {
    user_fk_id: any;
    role_fk_id: any;
  }
) => a.user_fk_id === b.user_fk_id && a.role_fk_id === b.role_fk_id;

module.exports = roleRouteMapping;
