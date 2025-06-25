const generateRandomString = (length: number, appendDateString:boolean = false, appendTimeString: boolean = false) => {
  let date = new Date(), dateString = "", timeString = "";
  if(appendDateString){
    dateString = `${date.getUTCFullYear()}${
      date.getUTCMonth() + 1
    }${date.getUTCDate()}`;
  }
  if(appendTimeString){
    timeString = `${date.getUTCHours()}${date.getUTCMinutes()}${date.getUTCSeconds()}`;
  }
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return `${dateString}${result}${timeString}`;
};

module.exports = generateRandomString;
