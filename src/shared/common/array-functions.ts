const checkArrayExist = (arr: any) => {
  let res: any = {};
  res.status = true;
  if (arr === undefined) {
    res.status = false;
    res.messageKey = "REP_UNDEFINED";
  }
  if (!Array.isArray(arr) && arr) {
    res.status = false;
    res.messageKey = "REP_NOT_ARRAY";
  }
  if (arr?.length === 0) {
    res.status = false;
    res.messageKey = "REP_ARRAY_EMPTY";
  }
  return res;
};

const checkArrObjectMissingKeys = async (arr: any[], keys: any[]) => {
  let res: any = {};
  res.status = true;
  let missingKeys: any[] = [];
  await arr.forEach(async (obj: any) => {
    const missing = await findObjectMissingKeys(obj, keys);
    if (missing.length > 0) {
      missingKeys = missingKeys.concat(missing);
    }
  });
  missingKeys = await uniqueArray(missingKeys);
  if (missingKeys.length > 0) {
    res.status = false;
    res.messageKey = "REP_MISSING_ARRAY_OBJECT_KEYS";
    res.missingKeys = missingKeys;
  }
  return res;
};

const findObjectMissingKeys = (obj: any, keys: any[]) => {
  const objectKeys = new Set(Object.keys(obj));
  const missingKeys = new Set([...keys].filter((key) => !objectKeys.has(key)));
  return [...missingKeys];
};

const uniqueArray = (arr: any[]) => {
  return [...new Set(arr)];
};

const getUniqueArrayObjectKey = (arr: any[], key: string) => {
  return [...new Set(arr.map((obj: any) => obj[key]))];
};

const onlyInLeft = (
  left: any[],
  right: any[],
  compareFunction: (arg0: any, arg1: any) => any
) =>
  left.filter(
    (leftValue: any) =>
      !right.some((rightValue: any) => compareFunction(leftValue, rightValue))
  );

const noneExist = (arr1: any[], arr2: any[]) => {
  let res: any = {};
  res.status = true;
  let tArrList = arr1.filter(function (el) {
    return arr2.indexOf(el) < 0;
  });
  if (tArrList.length > 0) {
    res.status = false;
    res.messageKey = "REP_DOES_NOT_EXIST";
  }
  return res;
};

const getArrayOfObjectIndex = (arr: any[], value: any, prop: string) => {
  return arr.findIndex((obj) => obj[prop] === value);
};

const uniqueArrayOfObject = (
  arr: any[],
  props = []
) => [
  ...new Map(
    arr.map((entry: { [x: string]: any }) => [
      props.map((k) => entry[k]).join("|"),
      entry,
    ])
  ).values(),
];

const uniqueArrayValues = (arrA: any[], arrB: any[]) =>{
  return arrB.filter((el) => !arrA.includes(el));
}

module.exports = {
  checkArrayExist,
  checkArrObjectMissingKeys,
  findObjectMissingKeys,
  uniqueArray,
  getUniqueArrayObjectKey,
  onlyInLeft,
  noneExist,
  getArrayOfObjectIndex,
  uniqueArrayOfObject,
  uniqueArrayValues
};
