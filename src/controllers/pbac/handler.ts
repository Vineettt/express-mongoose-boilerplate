import { NextFunction, Request, Response } from "express";
import { HTTPMethod } from "http-method-enum";
import { iResponse } from "../../shared/interfaces/iResponse";

const responseClass = require("@/shared/classes/responseClass");
const handlerMapping = require("@/shared/constants/handler-mapping")

const handler = async (req: Request, res: Response, next: NextFunction) => {
    let responseObject: iResponse = new responseClass();
    try {
      responseObject.resType = "TRY_BLOCK";
      responseObject.type = "JSON";
      if (req.method === HTTPMethod.GET) {
        const objectKeys = Object.keys(handlerMapping);
        objectKeys.splice(0,1);
        let handlerList : any[] = [];
        for (const itr of objectKeys) {
            let tempObj: any = {};
            tempObj['value'] = itr; 
            tempObj['viewValue'] = itr.toUpperCase();
            handlerList.push(tempObj)
        }

        responseObject.payload = {
            payload: handlerList
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