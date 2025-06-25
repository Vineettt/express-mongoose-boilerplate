import { fetchAllDbConfig } from "./dbConfig";
import { prompts } from "./langLoader";
import { fetchAllDbName } from "./dbNameLoader";

let cache: any;
export default function config() {
  if (!cache) {
    cache = Object.freeze({
      dbVariables: fetchAllDbConfig(),
      prompts: prompts(),
      dbNameMapping: fetchAllDbName(),
    });
  }
  return cache;
}
