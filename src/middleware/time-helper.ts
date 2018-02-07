import * as moment from 'moment';
import * as momenttz from 'moment-timezone';
import { isDuration } from 'moment';

export interface TimeHelper {
  uiFormat: string;
  calFormat: string;
  add(num:any): string;
  uidates():Object;
}

export const time: any = {};

time.uiformat = 'dddd MM/DD';
time.calformat = 'MM/DD/YYYY HH:mm:ss';

time.add = function(num: any) {
  return moment().add(num,'days').format(this.uiformat);
};

time.uidates = function() {
  return [2,3,4,'Other'].reduce((item, day, i) => {
    if(day==='Other') item[day] = [];
    else item[this.add(day)] = [];
    return item;
  }, {Today:[],Tomorrow:[]});
};

time.findEventProp = function(date:string) {
  const theDay = moment(date).format(this.uiformat),
        theDays = Object.keys(this.uidates());
  return theDays.indexOf(theDay) !== -1 ? theDay :
    moment().isSame(moment(date),'day') ? 'Today' :
    moment().add(1,'days').isSame(moment(date),'day') ? 'Tomorrow' :
    'Other';
};

time.dateFormatter = (date: Date): string =>
  momenttz.utc(date).tz(momenttz.tz.guess()).format('YYYY-MM-DD');

time.formatTime = function(date:string, time:string) {
  if(time.split(' ')[1] === 'am') {
    switch(time.split(':')[0]) {
      case '12':
        return date + 'T' + '00:' + time.split(':')[1].split(' ')[0];
      case '11':
      case '10':
        return date + 'T' + time.split(' ')[0];
      default:
        return date + 'T' + '0' + time.split(' ')[0];
    }
  } else {
    switch(time.split(':')[0]) {
      case '12':
        return date + 'T' + time.split(' ')[0];
      default:
        return date + 'T' + (parseInt(time.split(':')[0], 10) + 12) +
          ':' + time.split(':')[1].split(' ')[0];
    }
  }
};

time.normalizeDates = function(dates:any) {
  let start = moment(dates.startDate).format('YYYY-MM-DD'),
    end = moment(dates.endDate).format('YYYY-MM-DD'),
    timeZone = momenttz.tz.guess();
  return {
    start: {
      dateTime: moment(this.formatTime(start, dates.startTime))
        .format('YYYY-MM-DDTHH:mm:ss'),
      timeZone: this.convertZones[momenttz.tz(timeZone).format('z')]
    },
    end: {
      dateTime: moment(this.formatTime(end, dates.endTime))
        .format('YYYY-MM-DDTHH:mm:ss'),
      timeZone: this.convertZones[(momenttz.tz(timeZone).format('z'))]
    }
  };
};

time.convertZones = {
  EST: 'Eastern Standard Time',
  EDT: 'Eastern Daylight Time',
  CST: 'Central Standard Time',
  CDT: 'Central Daylight Time',
  MST: 'Mountain Standard Time',
  MDT: 'Mountain Daylight Time',
  PST: 'Pacific Standard Time',
  PDT: 'Pacific Daylight Time'
};

time.eventView = (date: string) => moment(new Date(date)).format('h:mm a');

time.meetingDuration = function(startTime, durationString) {
  const formattedDate = moment(this.formatTime(
    moment().format('YYYY-MM-DD'), startTime
  ));
  if(durationString === '1 hour') durationString = '1 hours';
  if(durationString === '1.5 hours') durationString = '90 minutes';
  return formattedDate.add(
    parseInt(durationString.split(' ')[0], 10), durationString.split(' ')[1]
  ).format('h:mm a');
};

time.now = moment();

time.addMinutes = function(minutes) {
  return moment(this.now).add(minutes,'minutes').format('h:mm a')
};

time.materialDatePickFormat = (date) => moment(date).format('MM/DD/YYYY');