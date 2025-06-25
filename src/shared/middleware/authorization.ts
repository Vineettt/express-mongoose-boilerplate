// import { iQueryParams } from "../interfaces/iQueryParams";
import config from "../../config/index";

const executeQuery = require("@/shared/common/execute-query");
const queryParams = require("@/shared/classes/queryParams");
const { verifyJwt } = require("@/shared/common/jwt");
const JWT_SECRET = process.env.JWT_SECRET;
const { prompts } = config();
const { StatusCode } = require("status-code-enum");

const authorization = async (
  req: {
    method: any;
    url: any;
    headers: { authorization: any; "accept-language": any };
  },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: { (arg0: { errors: any }): void; new (): any };
    };
  },
  next: any
) => {
  const lang: any = req.headers["accept-language"] || "eu";
  try {
    const token = req.headers.authorization;
    await verifyJwt(token, JWT_SECRET)
      .then(async (decoded: any) => {
        // let qPClass: iQueryParams = new queryParams();
        // qPClass.dbName = "PBAC";
        // qPClass.qyKey = "ROLE_MAPPING_USER_ID";
        // qPClass.options_type = "SELECT";
        // qPClass.replacements = {
        //   endpoint: req.url,
        //   method: req.method.toLowerCase(),
        //   user_id: decoded.key,
        // };
        // let user_data = await executeQuery(qPClass);
        // if (user_data?.length > 0) {
          next();
        // } else {
        //   res
        //     .status(StatusCode?.ClientErrorForbidden)
        //     .json({ errors: { message: prompts[lang]["NOT_AUTH"] } });
        // }
      })
      .catch((error: any) => {
        res
          .status(StatusCode?.ServerErrorInternal)
          .json({ errors: { message: prompts[lang]["SERVER_SIDE_WRONG"] } });
      });
  } catch (error) {
    res
      .status(StatusCode?.ServerErrorInternal)
      .json({ errors: { message: prompts[lang]["SERVER_SIDE_WRONG"] } });
  }
};

module.exports = authorization;
