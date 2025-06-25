const timeDifference = async (date1: number, date2: number) => {
  let difference = date1 - date2;
  var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
  difference -= daysDifference * 1000 * 60 * 60 * 24;
  var hoursDifference = Math.floor(difference / 1000 / 60 / 60);
  difference -= hoursDifference * 1000 * 60 * 60;
  var minutesDifference = Math.floor(difference / 1000 / 60);
  difference -= minutesDifference * 1000 * 60;
  var secondsDifference = Math.floor(difference / 1000);
  const dateTimeObject = {
    days: daysDifference,
    hour: hoursDifference,
    minutes: minutesDifference,
    seconds: secondsDifference,
  };
  return dateTimeObject;
};

module.exports = timeDifference;
