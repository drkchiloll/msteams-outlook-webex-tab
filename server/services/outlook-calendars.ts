import { MsGraph } from '../lib';
import * as Promise from 'bluebird';
import * as moment from 'moment';
import * as momentTz from 'moment-timezone';

import { timeProc } from '../services/event-dates';

export function outlookServFactory(graph: MsGraph) {
  const service: any = {};

  service.get = function(tz) {
    let events: any, eventProp: string;
    return graph._request({
      body: {},
      method: 'get',
      path: '/beta/me/events'
    }).then(({value}: any) => {
      events = timeProc.uiDates();
      if(value && value.length > 0) {
        return Promise.each(value, (val:any) => {
          let event: any = {};
          event.id = val.id;
          event.subject = val.subject;
          event.link = val.webLink;
          event.html = val.body.contentType === 'html' ?
            val.body.content : '';
          event.startDate = timeProc.normalizeMsDate({
            date: val.start.dateTime, tz
          });
          event.endDate = timeProc.normalizeMsDate({
            date: val.end.dateTime, tz
          });
          event.location = val.location.displayName || '';
          event.organizer = {
            name: val.organizer.emailAddress.name,
            email: val.organizer.emailAddress.address
          };
          eventProp = timeProc.compareDates({
            date: val.start.dateTime, tz
          });
          console.log(eventProp);
          return Promise.map(val.attendees, (att: any) => ({
            name: att.emailAddress.name || '',
            emailAddress: att.emailAddress.address,
            status: att.status.response,
            type: att.type
          })).then(attendees => {
            console.log(eventProp);
            event.attendees = attendees;
            events[eventProp].push(event);
            return;
          });
        }).then(() => {
          // console.log(events);
          return events;
        })
      }
    });
  };

  service.createEvent = function(body: any) {
    /*
      {
        subject: Event Title
        body: {contentType: html, content: Message},
        start: {dateTime: 2017-04-15T12:00:00, timeZone: Pacific Standard Time},
        end: {same as above},
        location: { displayName: Name },
        attendees: [{
          emailAddress: {address: me@example.com, name: Me},
          type: required|optional|resource
        }]
      }
    */
    return graph._request({
      body,
      method: 'post',
      path: '/beta/me/events'
    });
  };

  return service;
};