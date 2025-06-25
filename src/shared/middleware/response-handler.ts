import { NextFunction, Request, Response } from "express";
import { iResponse } from "../interfaces/iResponse";
import config from "../../config/index";
const { prompts } = config();

const responseTypes = require("@/shared/constants/response-types");
const commonMapping = require("@/shared/constants/common-mapping");
const statusMapping = require("@/shared/constants/status-mapping");
const regexList = require("@/shared/constants/regex-list");
const { StatusCode } = require("status-code-enum");
const {replaceStringPlaceHolder} = require("@/shared/common/string-functions")

const responseHandler = async (
  payload: iResponse,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(payload)
  const lang:any =req.headers['accept-language']  || "eu";
  if (responseTypes[payload.resType] === responseTypes["TRY_BLOCK"]) {

    let status_code = payload?.statusCodeKey
      ? StatusCode[statusMapping[payload.statusCodeKey]]
      : StatusCode[statusMapping[req.method]];
    let mess_key = payload?.messageKey || "CONTACT_ADMIN";
    if (commonMapping[payload.type] === commonMapping["JSON"]) {
      let resPayload: any = {
        message: prompts[lang][mess_key]
      }
      for (const key in payload?.payload) {
        resPayload[key] = payload?.payload[key];
      }
      res.status(status_code).json(resPayload);
    } else {
    }
  }
  
  if (responseTypes[payload.resType] === responseTypes["CATCH_BLOCK"]) {
    let errorObj = await formatError(
      payload.payload,
      StatusCode[
        statusMapping[`${req.method}_${responseTypes[responseTypes["ERROR"]]}`]
      ],
      lang
    );
    if (commonMapping[payload.type] === commonMapping["JSON"]) {
      res.status(errorObj.status).json({
        errors: errorObj.message || "Internal Server Error",
      });
    }else{
    }
  }

  if (responseTypes[payload.resType] === responseTypes["WARNING_BLOCK"]) {
    let errorObj = await formatWarning(
      payload.payload,
      StatusCode[
        statusMapping[`${req.method}_ERROR`]
      ],
      lang
    );
    if (commonMapping[payload.type] === commonMapping["JSON"]) {
      res.status(errorObj.status).json({
        warnings: errorObj.message || "Internal Server Error",
      });
    }else{
    }
  }
};

const formatWarning = (err: any, status: number = 500, lang:string) => {
  let warnings: any = {};
  
  if(prompts[lang][err.message]){
    if(commonMapping[err?.func] === commonMapping["REP_STRING"]){
      warnings['message'] = replaceStringPlaceHolder(prompts[lang][err.message], err?.stringList);
      warnings.IGNORE_KEY = err?.propKey?.toUpperCase();
    }
  }
  return {
    message: warnings,
    status,
  };
}

const formatError = (err: any, status: number = 500, lang:string) => {
  console.log(err.message)
  let errors: any = {};

  if(err?.message?.includes(commonMapping["UNDEFINED"])){
    let errorArrayObject = regexList[commonMapping["DOUBLE_QUOTES"]].exec(err?.message);
    if(errorArrayObject !== null){
      let prompt_key = `${errorArrayObject[1].toUpperCase()}_${commonMapping["UNDEFINED"].toUpperCase()}`;
      errors[errorArrayObject[1]] = prompts[lang][prompt_key];
    }
  }

  if(prompts[lang][err.message]){
    if(commonMapping[err?.func] === commonMapping["REP_STRING"]){
      errors[err?.propKey] = replaceStringPlaceHolder(prompts[lang][err.message], err?.stringList);
    }else{
      let stringArray = err.message.split("_");
      errors[stringArray[0].toLowerCase()] = prompts[lang][err.message];
    }
  }

  for (var key in err?.errors) {
    var properties = err.errors[key];
    if(prompts[lang][properties.message]){
      errors[properties.path] = prompts[lang][properties.message];
    }else{
      errors[properties.path] = properties.message;
    }
  }

  if(Object.keys(errors)?.length === 0){
    errors['Error'] = 'Internal Error';
  }

  return {
    message: errors,
    status,
  };
};

module.exports = responseHandler;