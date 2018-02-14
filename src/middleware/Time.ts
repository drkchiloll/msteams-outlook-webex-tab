import * as moment from 'moment';
import * as momenttz from 'moment-timezone';
import { isDuration, Moment } from 'moment';

export abstract class Time {
  public static readonly DAY = 'day';
  public static readonly DAYS = 'days';
  public static readonly HOURS = 'hours';
  public static readonly MINUTES = 'minutes';
  public static uiformat: string = 'dddd MM/DD';
  public static calformat: string = 'MM/DD/YYYY HH:mm:ss';
  public static pickerformat: string = 'YYYY-MM-DD';
  public static materialformat: string = 'MM/DD/YYYY';
  public static outlookformat: string = 'YYYY-MM-DDTHH:mm:ss';
  public static eventformat: string = 'h:mm a';
  public static timezone: string = momenttz.tz.guess();

  static MOMENT = (date?) => date ? moment(new Date(date)) :
    moment();

  static getDate = (date?) => date ? new Date(date) : new Date();

  static add(num) {
    return moment().add(num, this.DAYS).format(this.uiformat);
  };

  static uidates() {
    return [2,3,4,'Other'].reduce((item, day) => {
      day === 'Other' ? item[day] = [] : item[this.add(day)] = [];
      return item;
    }, { Today: [], Tomorrow: [] });
  };

  static findEventProp(date: string) {
    const theDay = moment(this.getDate(date)).format(this.uiformat),
          theDays = Object.keys(this.uidates()),
          MOMENT = moment(this.getDate(date));
    return theDays.indexOf(theDay) !== -1 ? theDay :
      moment().isSame(MOMENT, 'day') ? 'Today' :
      moment().add(1, this.DAYS).isSame(MOMENT, 'day') ? 'Tomorrow' :
      'Other';
  };

  static dateFormatter(date: Date) {
    return momenttz.utc(date).tz(this.timezone).format(this.pickerformat);
  };

  static formatTime(date, time) {
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

  static formatZone() {
    return this.zones[momenttz.tz(this.timezone).format('z')];
  };

  static normalizeDates(dates) {
    const { startDate, startTime, endDate, endTime } = dates;
    const START = moment(startDate).format(this.pickerformat),
          END = moment(endDate).format(this.pickerformat),
          timeZone = this.formatZone();
    return {
      start: {
        dateTime: moment(this.formatTime(START, startTime))
          .format(this.outlookformat),
        timeZone
      },
      end: {
        dateTime: moment(this.formatTime(END, endTime))
          .format(this.outlookformat),
        timeZone
      }
    };
  };

  static eventView(date) {
    return moment(new Date(date)).format(this.eventformat);
  };

  static meetingDuration(time, duration) {
    const formattedDate = moment(this.formatTime(
      moment().format(this.pickerformat), time
    ));
    if(duration === '1 hour') duration = '1 hours';
    if(duration === '1.5 hours') duration = '90 minutes';
    return formattedDate.add(
      parseInt(duration.split(' ')[0], 10), duration.split(' ')[1]
    ).format(this.eventformat);
  };

  static addMinutes(minutes) {
    return moment().add(minutes, this.MINUTES).format(this.eventformat);
  };

  static materialDatePickFormat(date) {
    return moment(date).format(this.materialformat);
  };

  static webexFormat(date?) {
    let thisMoment = date ? moment(new Date(date)) : moment()
    return thisMoment.format(this.calformat);
  };

  static cal(date) {
    return moment(this.getDate(date)).format(Time.calformat);
  }

  static zones = {
    EST: 'Eastern Standard Time',
    EDT: 'Eastern Daylight Time',
    CST: 'Central Standard Time',
    CDT: 'Central Daylight Time',
    MST: 'Mountain Standard Time',
    MDT: 'Mountain Daylight Time',
    PST: 'Pacific Standard Time',
    PDT: 'Pacific Daylight Time'
  };
}
