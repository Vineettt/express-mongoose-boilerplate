import { iydmGenClass } from "../interfaces/iydmGenClass";

const moment = require("moment");

const generateRange = (ydmGen: iydmGenClass) => {
  const months = [];
  const momentStartDate = moment(ydmGen.startDate);
  const momentEndDate = moment(ydmGen.endDate);

  const currentMonth = momentStartDate.clone().startOf(ydmGen.unit);
  while (currentMonth.isSameOrBefore(momentEndDate, ydmGen.unit)) {
    months.push(currentMonth.format(ydmGen.format));
    currentMonth.add(ydmGen.increment, ydmGen.unit);
  }
  return months;
};

const getTodayDate = (ydmGen: iydmGenClass) => {
  return moment().format(ydmGen.format);
};

module.exports = {
  generateRange,
  getTodayDate
};
