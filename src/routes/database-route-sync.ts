import fs from "fs";
import path from "path";
const logger = require("@/shared/common/logger");
const {
  removeExtension,
  lastElement,
} = require("@/shared/common/string-functions");
const {
  onlyInLeft,
  uniqueArrayOfObject,
} = require("@/shared/common/array-functions");
const DBs = require("@/shared/constants/dbs-list");

const db = require("@/models/index");
const RoleRouteMapping = db[DBs?.PBAC?.toLowerCase()]?.models?.role_route_mappings;
const Routes = db[DBs?.PBAC?.toLowerCase()]?.models?.routes;

const regex = /(?<!\w)req\.method\s*===*\s*([^\s,]+)/g;
let match;

const initRouteListAndSync = async (dirPath: string) => {
  try {
    let rList: any = await iterateFiles(dirPath, "", []);
    rList = await uniqueArrayOfObject(rList, ["method", "endpoint", "type"]);

    const routes = await Routes.find().lean();

    const insertAO = await onlyInLeft(rList, routes, isSameUser);
    const deleteAO = await onlyInLeft(routes, rList, isSameUser);

    let insertDataCO: any[] = [];
    for (const itr of insertAO) {
      insertDataCO.push({
        method: itr.method,
        endpoint: itr.endpoint,
        type: itr.type,
      });
    }

    if (insertDataCO.length) {
      await Routes.insertMany(insertDataCO);
    }

    const deleteIds = deleteAO.map((itr: { id: any; }) => itr.id);
    if (deleteIds.length) {
      await Routes.deleteMany({ id: { $in: deleteIds } });
      await RoleRouteMapping.deleteMany({ route_fk_id: { $in: deleteIds } });
    }

    return rList;
  } catch (error) {
    logger.error(`Init RouteSync ${error}`);
  }
};

const iterateFiles = async (
  dirPath: string,
  sub_path: string,
  routeList: any[]
): Promise<any[]> => {
  try {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(dirPath, file.name);

      if (file.isDirectory()) {
        let temp_sub_path = `${sub_path}\\${file.name}`;
        let tempArray = await iterateFiles(filePath, temp_sub_path, []);
        routeList = routeList.concat(tempArray);
      } else {
        try {
          const content = fs.readFileSync(filePath, "utf-8");
          let tempArray = await getMethods(
            content,
            removeExtension(file.name),
            sub_path
          );
          routeList = routeList.concat(tempArray);
        } catch (error) {
          logger.error(`Error reading file: ${filePath}`, error);
        }
      }
    }

    return routeList;
  } catch (error) {
    logger.error(`Iterate ${error}`);
    return [];
  }
};

const getMethods = async (
  content: string,
  endpoint: string,
  sub_path: string
): Promise<any[]> => {
  try {
    const tempEPASP = await generateSubPathAndEndpoint(endpoint, sub_path);
    let tempArray: any[] = [];

    // Split content into lines and filter out commented lines
    const lines = content.split("\n").filter((line) => {
      const trimmed = line.trim();
      return (
        !trimmed.startsWith("//") &&
        !trimmed.startsWith("*") &&
        !trimmed.startsWith("/*")
      );
    });

    // Join filtered lines back into a single string for regex execution
    const filteredContent = lines.join("\n");
    let match;
    while ((match = regex.exec(filteredContent)) !== null) {
      let tempObj: any = {};
      tempObj.method = lastElement(match[1], ".")
        .replace(")", "")
        .toLowerCase();
      tempObj.endpoint = tempEPASP.endpoint;
      tempObj.type = tempEPASP.sub_path;
      tempArray.push(tempObj);
    }

    return tempArray;
  } catch (error) {
    logger.error(`Get Method ${error}`);
    return [];
  }
};

const generateSubPathAndEndpoint = (endpoint: string, sub_path: string) => {
  let subPathArray = sub_path.split("\\");
  let tempEPASB: any = {};

  if (subPathArray.length === 1) {
    tempEPASB.sub_path = "";
  } else if (subPathArray.length >= 2) {
    tempEPASB.sub_path = subPathArray[1];
    subPathArray.splice(1, 1);
  }

  subPathArray.push(endpoint);
  tempEPASB.endpoint = subPathArray.join("/");

  return tempEPASB;
};

const isSameUser = (
  a: { method: any; endpoint: any; type: any },
  b: { method: any; endpoint: any; type: any }
) => a.method === b.method && a.endpoint === b.endpoint && a.type === b.type;

export { iterateFiles, getMethods, initRouteListAndSync };
