import {iCustomErrorClass} from "../interfaces/iCustomErrorClass"

class customErrorClass extends Error implements iCustomErrorClass  {
    func: string;
    stringList: any[] | undefined;
    propKey: string | undefined;
    constructor(message:string, func: string, stringList?:any[], propKey?:string) {
        super(message);
        this.func = func;
        this.stringList = stringList;
        this.propKey = propKey
    }
}

module.exports = customErrorClass;