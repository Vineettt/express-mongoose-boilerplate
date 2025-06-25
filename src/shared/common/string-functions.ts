const removeExtension = (fileName: string) => {
  return fileName.split(".").slice(0, -1).join(".");
};

const lastElement = (fileName: string, separator: string) => {
  let array = fileName.split(separator);
  if(array.length > 0){
    return array[array.length-1];
  }
  return ""
}

const replaceStringPlaceHolder =(text: string, rSArray: any[]) =>{
  for (let index = 0; index < rSArray?.length; index++) {
    text = text.replace(`%%${index+1}`, rSArray[index]);
  }
  return text;
}

const stringUndefined = (text:string, valText:string)=>{
  let res: any = {};
  res.status = true;
  if (text === undefined) {
    res.status = false;
    res.messageKey = "REP_IGNORE_KEY_UNDEFINED";
  }
  if (text && text !== valText) {
    res.status = false;
    res.messageKey = "REP_IGNORE_KEY_WRONG";
  }
  return res;
}

module.exports = { removeExtension, lastElement, replaceStringPlaceHolder, stringUndefined };
