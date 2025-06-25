import HTTPMethod from "http-method-enum";
import { NextFunction, Request, Response } from "express";
import { iResponse } from "../../shared/interfaces/iResponse";

const responseClass = require("@/shared/classes/responseClass");

const db = require("@/models");
const DBs = require("@/shared/constants/dbs-list");
const User = db[DBs?.AUTH?.toLowerCase()]?.models?.user;

const account = async (req: Request, res: Response, next: NextFunction) => {
  let responseObject: iResponse = new responseClass();
  try {
    responseObject.resType = "TRY_BLOCK";
    responseObject.type = "JSON";
    if (req.method === HTTPMethod.POST) {
      const { token } = req.body;
      const userStatus = await activationDetails(token, -1);
      if (userStatus == true) {
        await User.updateRow({ status: 0 }, { where: { token: token } });
        responseObject.messageKey = "ACCOUNT_ACTIVATED";
        next(responseObject);
      }
    }
    if (req.method === HTTPMethod.GET) {
      const { token } = req.body;
      const details = await accountDetailsByToken(token);
      responseObject.messageKey = "SUCCESS";
      responseObject.payload = {
        user: details,
      };
      next(responseObject);
    }
  } catch (error) {
    responseObject.resType = "CATCH_BLOCK";
    responseObject.type = "JSON";
    responseObject.payload = error;
    next(responseObject);
  }
};

const activationDetails = async function (token: any, status: any) {
  try {
    const user = await User.findOne({ token, status }).select(
      "-created_at -updated_at -deleted_at -is_deleted -password -login_attempts -_id"
    );
    if (!user) {
      throw Error("ACTIVATION_TOKEN_EXPIRED");
    }
    if (token == user.token) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    throw error;
  }
};

const accountDetailsByToken = async function (token: any) {
  try {
    if (!token || typeof token !== "string" || token.trim() === "") {
      throw new Error("TOKEN_IS_REQUIRED");
    }
    const user = await User.findOne({ token }).lean();
    if (!user) {
      throw Error("ACTIVATION_TOKEN_EXPIRED");
    }
    return {account_status: statusAccount(user?.status), id: user?.id, email: user?.email};
  } catch (error) {
    throw error;
  }
};

const statusAccount = (status: number) => {
  let account_status = "UNKNOW";
  switch (status) {
    case -2:
      account_status = "LOCKED";
      break;
    case -1:
      account_status = "PENDING";
      break;
    case 0:
      account_status = "ACTIVATE";
      break;
  }
  return account_status;
};


module.exports = account;
