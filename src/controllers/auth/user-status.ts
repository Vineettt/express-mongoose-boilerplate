import { NextFunction, Request, Response } from "express";
import { HTTPMethod } from "http-method-enum";
import { iResponse } from "../../shared/interfaces/iResponse";

const responseClass = require("@/shared/classes/responseClass");
const accountStatus = require("@/shared/constants/account-status");

const handler = async (req: Request, res: Response, next: NextFunction) => {
    let responseObject: iResponse = new responseClass();
    try {
      responseObject.resType = "TRY_BLOCK";
      responseObject.type = "JSON";
      if (req.method === HTTPMethod.GET) {
        const objectKeys = Object.keys(accountStatus);
        let statusList : any[] = [];
        for (const itr of objectKeys) {
            let tempObj: any = {};
            tempObj['value'] = itr; 
            tempObj['viewValue'] = itr.split("_").join(" ").toUpperCase();
            statusList.push(tempObj)
        }

        responseObject.payload = {
            payload: statusList
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

}

module.exports = handler;