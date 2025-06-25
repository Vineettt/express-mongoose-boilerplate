import { NextFunction, Request, Response } from "express";
import { HTTPMethod } from "http-method-enum";
import { iResponse } from "../../shared/interfaces/iResponse";

const responseClass = require("@/shared/classes/responseClass");
const generateRandomString = require("@/shared/common/generate-random-string");
const timeDifference = require("@/shared/common/time-difference");
const customErrorClass = require("@/shared/classes/customErrorClass");
const db = require("@/models");
const User = db.users;

const user = async (req: Request, res: Response, next: NextFunction) => {
  let responseObject: iResponse = new responseClass();
  try {
    responseObject.resType = "TRY_BLOCK";
    responseObject.type = "JSON";
    if (req.method === HTTPMethod.POST) {
      const { password, repeat_password, token } = req.body;
      const email = await resetPassword(password, repeat_password, token);
      responseObject.messageKey = "PASSWORD_UPDATE_SUCCESSFULLY";
      next(responseObject);
    }
    if (req.method === HTTPMethod.PUT) {
      const { email } = req.body;
      const token = await forgotPassword(email);
      responseObject.messageKey = "SUCCESSFULLY_REGISTERED";
      next(responseObject);
    }
  } catch (error) {
    responseObject.resType = "CATCH_BLOCK";
    responseObject.type = "JSON";
    responseObject.payload = error;
    next(responseObject);
  }
};

const resetPassword = async function (
  password: any,
  repeat_password: any,
  token: any
) {
  try {
    const user = await User.findOne({
      where: {
        reset_token: token,
        status: 0,
        reset_status: 1,
      },
      attributes: {
        exclude: [
          "created_at",
          "updated_at",
          "deleted_at",
          "is_deleted",
          "password",
          "login_attempts",
        ],
      },
    });
    if (!user) {
      throw Error("RESET_TOKEN_EXPIRED");
    }
    if (!password) {
      throw Error("PASSWORD_REQUIRED");
    }
    if (!repeat_password) {
      throw Error("REPEAT_PASSWORD");
    }
    if (password != repeat_password) {
      throw Error("PASSWORD_MISMATCH");
    }
    await User.updateRow(
      { password: password, reset_status: 0 },
      { where: { email: user.email, id: user.id } }
    );
    return user.email;
  } catch (error) {
    throw error;
  }
};

const forgotPassword = async function (email: any) {
  try {
    const user = await User.findOne({
      where: {
        email,
      },
      attributes: {
        exclude: [
          "created_at",
          "deleted_at",
          "is_deleted",
          "password",
          "login_attempts",
        ],
      },
    });
    if (!user) {
      throw Error("EMAIL_INCORRECT");
    }
    if (user.status == -1) {
      throw Error("ACTIVATE_ACCOUNT");
    }
    if (user.reset_status == 1) {
      const updateDate = new Date(
        user.updated_at.getTime() + 10 * 60000
      ).getTime();
      const futureDate = new Date().getTime();
      if (updateDate > futureDate) {
        const dateTimeObject = await timeDifference(updateDate, futureDate);
        const stringList: any = [
          `${dateTimeObject.minutes}:${dateTimeObject.seconds}`,
        ];
        throw Error(
          new customErrorClass(
            "RESET_PASSWORD_ALREADY_SEND",
            "REP_STRING",
            stringList
          )
        );
      }
    }
    let randomString = await generateRandomString(64);
    const response = await User.updateRow(
      { reset_token: randomString, reset_status: 1 },
      { where: { email: user.email, id: user.id } }
    );
    return randomString;
  } catch (error) {
    throw error;
  }
};

module.exports = user;
