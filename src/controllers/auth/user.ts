import { NextFunction, Request, Response } from "express";
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
const { HTTPMethod } = require("http-method-enum");
const responseClass = require("@/shared/classes/responseClass");
const generateRandomString = require("@/shared/common/generate-random-string");
const executeQuery = require("@/shared/common/execute-query");
const queryParams = require("@/shared/classes/queryParams");
const sendMail = require("@/shared/email/send-email");
const accountStatus = require("@/shared/constants/account-status");
const db = require("@/models");
const DBs = require("@/shared/constants/dbs-list");
const User = db[DBs?.AUTH?.toLowerCase()]?.models?.user;
const Role = db[DBs?.PBAC?.toLowerCase()]?.models?.roles;
const UseRoleMapping = db[DBs?.PBAC?.toLowerCase()]?.models?.user_role_mappings;
const { verifyJwt } = require("@/shared/common/jwt");
const JWT_SECRET = process.env.JWT_SECRET;

const user = async (req: Request, res: Response, next: NextFunction) => {
  let responseObject: iResponse = new responseClass();
  try {
    responseObject.resType = "TRY_BLOCK";
    responseObject.type = "JSON";
    if (req.method === HTTPMethod.POST) {
      const { email, password, first_name, last_name } = req.body;
      const user = {
        email,
        password,
        first_name,
        last_name,
      };
      const response = await User.create(user);
      const role_user = await Role.findOne({ role: "user" });
      const ur_mapping = {
        user_fk_id: response.id,
        role_fk_id: role_user.id,
      };

      await UseRoleMapping.create(ur_mapping);

      let activationToken = await generateRandomString(64, true, true);
      
      await User.updateOne(
        { id: response.id },
        { $set: { token: activationToken } }
      );

      responseObject.messageKey = "SUCCESSFULLY_REGISTERED";
      next(responseObject);
    }
    if (req.method === HTTPMethod.GET) {
      const token = req.headers.authorization;
      let vJwtPayload = await verifyJwt(token, JWT_SECRET);
      const user = await userDetailsByID(vJwtPayload.key);

      //   let qPClassR: iQueryParams = new queryParams();
      //   qPClassR.dbName = "PBAC";
      //   qPClassR.qyKey = "USER_ROLES";
      //   qPClassR.options_type = "SELECT";
      //   qPClassR.replacements = {
      //     user_fk_id: user.id,
      //   };
      //   let roles = await executeQuery(qPClassR);
      //   user.dataValues.roles = await getUniqueArrayObjectKey(roles, ['role']);

      //   let qPClassP: iQueryParams = new queryParams();
      //   qPClassP.dbName = "PBAC";
      //   qPClassP.qyKey = "USER_PERMISSIONS";
      //   qPClassP.options_type = "SELECT";
      //   qPClassP.replacements = {
      //     user_fk_id: user.id,
      //   };
      //   let permissions = await executeQuery(qPClassP);
      //   delete user.dataValues.status;
      //   delete user.dataValues.login_attempts;
      //   user.dataValues.permissions = permissions;
      //   responseObject.messageKey = "SUCCESSFULLY_FETCHED";
      //   responseObject.payload = {
      //     user: user,
      //   };
      //   next(responseObject);
    }
    if (req.method === HTTPMethod.PUT) {
      const { user, IGNORE_KEY } = req.body;
      let iKExist = await stringUndefined(IGNORE_KEY, "EDIT_USER");
      if (!iKExist?.status) {
        responseObject.resType = "WARNING_BLOCK";
        responseObject.type = "JSON";
        responseObject.payload = new customErrorClass(
          iKExist.messageKey,
          "REP_STRING",
          ["edit", ""],
          "EDIT_USER"
        );
        next(responseObject);
        return;
      }
      let cAExist = await checkArrayExist(user);
      if (!cAExist?.status) {
        throw new customErrorClass(
          cAExist.messageKey,
          "REP_STRING",
          ["User"],
          "user"
        );
      }
      let CAOMKeys = await checkArrObjectMissingKeys(user, [
        "first_name",
        "last_name",
        "status",
        "id",
      ]);
      if (!CAOMKeys?.status) {
        throw new customErrorClass(
          CAOMKeys.messageKey,
          "REP_STRING",
          ["User", CAOMKeys?.missingKeys?.join(",")],
          "user"
        );
      }

      let user_list = await getUniqueArrayObjectKey(user, ["id"]);

      const uList = await User.find({
        id: { $in: user_list },
      });

      const changeUser = await onlyInLeft(uList, user, isSimilar);

      if (changeUser.length === 0) {
        throw new Error("NO_CHANGE_REQUIRED");
      }

      for (const itr of changeUser) {
        let fIndex = await getArrayOfObjectIndex(user, itr.id, "id");
        if (fIndex !== -1) {
          const updateFields = {
            first_name: user[fIndex]?.first_name,
            last_name: user[fIndex]?.last_name,
            status: accountStatus[user[fIndex]?.status],
          };
          await User.updateOne({ _id: itr._id }, { $set: updateFields });
        }
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

const userDetailsByID = async function (id: string) {
  const user = await User.findOne({
    where: { id: id, status: accountStatus["ACCOUNT_ACTIVATED"] },
    attributes: {
      exclude: [
        "reset_token",
        "token",
        "reset_status",
        "created_at",
        "updated_at",
        "deleted_at",
        "is_deleted",
        "password",
        "login_attempts",
      ],
    },
  });
  if (user) {
    return user;
  }
};

const isSimilar = (
  a: {
    first_name: any;
    last_name: any;
    status: any;
  },
  b: {
    first_name: any;
    last_name: any;
    status: any;
  }
) =>
  a.first_name === b.first_name &&
  a.last_name === b.last_name &&
  a.status === accountStatus[b.status];

module.exports = user;
