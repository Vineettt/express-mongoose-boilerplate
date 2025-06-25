import config from "../../config/index";

const { verifyJwt } = require("@/shared/common/jwt");
const JWT_SECRET = process.env.JWT_SECRET;
const { prompts } = config();
const { StatusCode } = require("status-code-enum");

const authentication = async (
  req: { headers: { authorization: any; "accept-language": any }; key: any },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: { (arg0: { errors: any }): any; new (): any };
    };
  },
  next: () => void
) => {
  const lang: any = req.headers["accept-language"] || "eu";
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(StatusCode?.ClientErrorForbidden)
        .json({ errors: { message: prompts[lang]["ACCESS_DENIED_AUTH"] }});
    }
    if (!token) {
      return res
        .status(StatusCode?.ClientErrorForbidden)
        .json({ errors: {message: prompts[lang]["ACCESS_DENIED_TOKEN"] }});
    } else {
      try {
        const decoded = await verifyJwt(token, JWT_SECRET);
        req.key = decoded.key;
        next();
      } catch (err: any) {
        if (err.name === "TokenExpiredError") {
          return res
            .status(StatusCode?.ClientErrorUnauthorized)
            .json({errors: { message: prompts[lang]["SESSION_TIME_OUT"]} });
        } else if (err.name === "JsonWebTokenError") {
          return res
            .status(StatusCode?.ClientErrorUnauthorized)
            .json({errors: { message: prompts[lang]["INVALID_TOKEN_LOGIN"]} });
        } else {
          return res
            .status(StatusCode?.ClientErrorBadRequest)
            .json({errors: { message: err} });
        }
      }
    }
  } catch (error) {
    res
      .status(StatusCode?.ServerErrorInternal)
      .json({errors: { message: prompts[lang]["SERVER_SIDE_WRONG"] }});
  }
};

module.exports = authentication;
