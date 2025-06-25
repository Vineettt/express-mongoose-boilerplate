const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);
const { removeExtension } = require("@/shared/common/string-functions");

let promptObjects: any;

export const prompts = () => {
  try {
    if (!promptObjects) {
      promptObjects = {};
      fs.readdirSync(`${__dirname}/languages`)
        .filter((file: string) => {
          return (
            file.indexOf(".") !== 0 &&
            file !== basename &&
            file.slice(-3) === ".js"
          );
        })
        .forEach(async (file: any) => {
          const model = require(path.join(
            `${__dirname}/languages`,
            removeExtension(file)
          ));
          promptObjects[removeExtension(file)] = model;
        });
    }
    return promptObjects;
  } catch (error) {
    return {};
  }
};
