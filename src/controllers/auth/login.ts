import { NextFunction, Request, Response } from "express";
import HTTPMethod from "http-method-enum";
import { iResponse } from "../../shared/interfaces/iResponse";

const { getUniqueArrayObjectKey } = require("@/shared/common/array-functions");
const responseClass = require("@/shared/classes/responseClass");
const { hashCompare } = require("@/shared/common/hashing");
const { generateJwt } = require("@/shared/common/jwt");
const accountStatus = require("@/shared/constants/account-status");
const timeDifference = require("@/shared/common/time-difference");
const customErrorClass = require("@/shared/classes/customErrorClass");

const db = require("@/models");
const DBs = require("@/shared/constants/dbs-list");
const User = db[DBs?.AUTH?.toLowerCase()]?.models?.user;
const RoleRouteMappings =
  db[DBs?.PBAC?.toLowerCase()]?.models?.role_route_mappings;
const UserRoleMappings =
  db[DBs?.PBAC?.toLowerCase()]?.models?.user_role_mappings;

const JWT_EXPIRES_IN = 60 * 60 * 24 * 365;
const { JWT_SECRET } = process.env;

const login = async (req: Request, res: Response, next: NextFunction) => {
  let responseObject: iResponse = new responseClass();
  try {
    responseObject.resType = "TRY_BLOCK";
    responseObject.type = "JSON";
    if (req.method === HTTPMethod.POST) {
      const { email, password } = req.body;
      let user = await getUserByEmailAndPassword(email, password);
      user = JSON.parse(JSON.stringify(user));
      let roles = await UserRoleMappings.aggregate([
        {
          $lookup: {
            from: "roles",
            localField: "role_fk_id",
            foreignField: "id",
            as: "role_info",
          },
        },
        {
          $unwind: "$role_info", // Optional, but often useful to flatten the result
        },
        {
          $match: {
            user_fk_id: user.id, // This is the WHERE clause
          },
        },
      ]);
      let rolesArray = await getUniqueArrayObjectKey(roles, ["role_info"]);
      user.roles = await getUniqueArrayObjectKey(rolesArray, ["role"]);

      let permissionsList = await RoleRouteMappings.aggregate([
        {
          $lookup: {
            from: "routes",
            localField: "route_fk_id",
            foreignField: "id",
            as: "routes_info",
          },
        },
        {
          $lookup: {
            from: "user_role_mappings",
            localField: "route_fk_id",
            foreignField: "role_fk_id",
            as: "role_info",
          },
        },
      ]);

      console.log(permissionsList, "******");

      if (user.status === accountStatus["ACCOUNT_ACTIVATED"]) {
        const access_token = await generateJwt(
          {
            email: user.email,
            key: user.id,
            role: user.role,
          },
          JWT_SECRET,
          JWT_EXPIRES_IN
        );
        delete user.status;
        delete user.updated_at;
        delete user.password;
        delete user.login_attempts;
        responseObject.messageKey = "LOGIN_SUCCESS";
        responseObject.payload = {
          token: access_token,
          user: user,
        };
        next(responseObject);
      } else {
        responseObject.messageKey = "ACTIVATE_ACCOUNT";
        responseObject.statusCodeKey = "ACTIVATION_PENDING";
        next(responseObject);
      }
    }
  } catch (error) {
    responseObject.resType = "CATCH_BLOCK";
    responseObject.type = "JSON";
    responseObject.payload = error;
    next(responseObject);
  }
};

const getUserByEmailAndPassword = async function (
  email: string,
  password: string
) {
  try {
    let user = await User.findOne({ email: email }).select(
      "-reset_token -token -reset_status -created_at -deleted_at -is_deleted -__v -_id"
    );
    if (!password) {
      throw Error("PASSWORD_REQUIRED");
    }
    if (user) {
      const isAuthenticated = await hashCompare(password, user.password);
      const updateDate = new Date(
        user.updated_at.getTime() + 1 * 60000
      ).getTime();
      const futureDate = new Date().getTime();
      if (
        user.status === accountStatus["ACCOUNT_LOCKED"] &&
        updateDate < futureDate
      ) {
        await User.updateRow(
          {
            login_attempts: 0,
            status: accountStatus["ACCOUNT_ACTIVATED"],
          },
          { where: { id: user.id } }
        );
        user.status = accountStatus["ACCOUNT_ACTIVATED"];
      }

      if (
        user.status === accountStatus["ACCOUNT_LOCKED"] &&
        updateDate > futureDate
      ) {
        const dateTimeObject = await timeDifference(updateDate, futureDate);
        const stringList: any = [
          `${dateTimeObject.minutes}:${dateTimeObject.seconds}`,
        ];
        throw new customErrorClass(
          "REP_ACCOUNT_LOCKED",
          "REP_STRING",
          stringList,
          "account_locked"
        );
      }
      if (isAuthenticated) {
        delete user.password;
        return user;
      }
      if (user.status === accountStatus["ACCOUNT_ACTIVATED"]) {
        let status_code =
          user.login_attempts > 3 ? "ACCOUNT_LOCKED" : "ACCOUNT_ACTIVATED";
        await User.updateRow(
          {
            login_attempts: user.login_attempts + 1,
            status: accountStatus[status_code],
          },
          { where: { id: user.id } }
        );
      }
      throw Error("PASSWORD_INCORRECT");
    } else {
      throw Error("EMAIL_INCORRECT");
    }
  } catch (error) {
    throw error;
  }
};

module.exports = login;
