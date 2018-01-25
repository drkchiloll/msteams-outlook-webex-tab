import * as moment from 'moment';
import * as momenttz from 'moment-timezone';

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