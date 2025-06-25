const caseExpression: any = {
  STATUS_SWITCH_CASE:
    "CASE WHEN users.status = '-2' THEN 'LOCKED' WHEN users.status = '-1' THEN 'PENDING' WHEN users.status = '0' THEN 'ACTIVATE' ELSE 'UNKNOW' END",
};

module.exports = caseExpression;
