import moment from 'moment';


// https://momentjs.com/
const dateFormatDefault = "YYYY/MM/DD";
const timeFormatDefault = "hh:mm";
const dateTimeFormatDefault = `${dateFormatDefault} ${timeFormatDefault}`;


const formatDate = (dateObj, format = dateFormatDefault) => {
  return moment(dateObj).format(format);
};

const formatTime = (dateObj, format = timeFormatDefault) => {
  return moment(dateObj).format(format);
};

const formatDateTime = (dateObj, format = dateTimeFormatDefault) => {
  return moment(dateObj).format(format);
};


export {
  formatDate,
  formatTime,
  formatDateTime
};