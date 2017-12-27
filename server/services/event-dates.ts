import * as moment from 'moment';
import * as momentTz from 'moment-timezone';

export let timeProc: any = {};

timeProc.uiFormat = 'dddd MM/DD';

timeProc.calFormat = 'MM/DD/YYYY HH:mm:mm';

timeProc.add = function(num: any) {  
  return moment().add(num, 'days').format(this.uiFormat);
};

timeProc.normalizeMsDate = function({date, tz}) {
  return momentTz.utc(
    moment.utc(date).format()
  ).tz(tz).format(this.calFormat);
};

timeProc.uiDates = function() {
  let day3 = this.add(2),
      day4 = this.add(3),
      day5 = this.add(4);
  let events = {
    Today: [], Tomorrow: []
  };
  events[day3] = [];
  events[day4] = [];
  events[day5] = [];
  events['Other'] = [];
  return events;
};

timeProc.compareDates = function({ date, tz }) {
  let eventDate = momentTz.utc(momentTz.utc(date).format())
    .tz(tz).format('dddd MM/DD');
  let today = momentTz(new Date().getTime())
    .tz(tz).format('dddd MM/DD');
  if(today === eventDate) {
    return 'Today';
  } else if(this.add(1, 'days') == eventDate) {
    return 'Tomorrow';
  } else if(this.add(2, 'days') == eventDate) {
    return eventDate;
  } else if(this.add(3, 'days') == eventDate) {
    return eventDate;
  } else if(this.add(4, 'days') == eventDate) {
    return eventDate
  } else {
    return 'Other';
  }
};