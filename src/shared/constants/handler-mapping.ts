const authentication = require("@/shared/middleware/authentication");
const authorization = require("@/shared/middleware/authorization");

const handlerMapping: any = {
  null_handler: [],
  "": [],
  public: [],
  restricted: [authentication, authorization],
};

module.exports = handlerMapping;
