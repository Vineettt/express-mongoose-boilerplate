export interface iResponse {
  type: string;
  resType: string;
  payload: any;
  statusCodeKey: string | undefined;
  func: string | undefined;
  stringList: any[] | undefined;
  messageKey: string | undefined;
}
