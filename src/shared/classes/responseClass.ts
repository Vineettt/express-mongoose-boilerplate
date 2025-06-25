import {iResponse} from "../interfaces/iResponse";

class reponseClass implements iResponse {
  type: string;
  resType: string;
  payload: any;
  statusCodeKey: string | undefined;
  func: string | undefined;
  stringList: any[] | undefined;
  messageKey: string | undefined;
  constructor(
    type: string,
    resType: string,
    payload: any,
    statusCodeKey?: string,
    messageKey?: string,
    func?: string,
    stringList?: any[]
  ) {
    this.type = type;
    this.resType = resType;
    this.payload = payload;
    this.statusCodeKey = statusCodeKey;
    this.func = func;
    this.stringList = stringList;
    this.messageKey = messageKey;
  }
}

module.exports = reponseClass;
