import moment from 'moment';


// https://momentjs.com/
const dateFormatDefault = "YYYY/MM/DD";
const timeFormatDefault = "HH:mm";
const dateTimeFormatDefault = `${dateFormatDefault} ${timeFormatDefault}`;
const dateTimeFormatForFileName = 'YYYY-MM-DD' + 'T' + 'HH-mm-ss';


const formatDate = (dateObj, format = dateFormatDefault) => {
  return moment(dateObj).format(format);
};

const formatTime = (dateObj, format = timeFormatDefault) => {
  return moment(dateObj).format(format);
};

const formatDateTime = (dateObj, format = dateTimeFormatDefault) => {
  return moment(dateObj).format(format);
};

const formatDateTimeForFileName = (dateObj) => {
  return formatDateTime(dateObj, dateTimeFormatForFileName);
}


export {
  formatDate,
  formatTime,
  formatDateTime,
  formatDateTimeForFileName
};