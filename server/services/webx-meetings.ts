import { Properties } from '../properties';
import * as Promise from 'bluebird';
import { WebEx } from '../lib/WebEx';
const { WebEx: { xsitype } } = Properties;
import { bodyBuilder, xsi, processors } from './index';
import * as moment from 'moment';

export function meetingsServFactory(webex: WebEx) {
  const service: any = {};

  service.getSummary = function() {
    const xsiType = `${xsitype}.meeting.LstsummaryMeeting`;
    const body = {
      listControl: {
        startFrom: '1',
        maximumNum: '30',
        listMethod: 'OR'
      },
      order: {
        orderBy: 'STARTTIME',
        orderAD: 'ASC'
      }
    };
    return webex.js2xml(
      bodyBuilder(body)
    ).then((query: string) => {
      return xsi(query, xsiType);
    }).then((query: string) => {
      return webex.genXml(query);
    }).then((xml: string) => {
      return webex._request({ body: xml });
    }).then((xml: string) => {
      return xml.replace(/meet\:/gi, '')
    }).then((xml:string) => {
      return processors.meetings(xml, 'meeting');
    });
  };

  service.get = function({ meetingKey }) {
    const xsiType = `${xsitype}.meeting.GetMeeting`;
    return webex.js2xml(
      bodyBuilder({ meetingKey })
    ).then((query: string) => {
      return xsi(query, xsiType);
    }).then((query) => {
      return webex.genXml(query);
    }).then((xml) => {
      return webex._request({ body: xml });
    }).then((xml: string) => {
      return xml
        .replace(/meet\:/gi, '')
        .replace(/att\:/gi, '')
        .replace(/com\:/gi, '')
    }).then((xml: string) => {/*xml);*/
      return processors.attendees(xml);
    }).then((result: any) => result);
  };

  service.create = function({ subject, attendees, startDate, duration, timeZone, agenda='' }) {
    const xsiType = `${xsitype}.meeting.CreateMeeting`;
    const meeting = {
      accessControl : { meetingPassword: 'pass123' },
      metaData: {
        confName: subject,
        // meetingType: '1',
        agenda: agenda || subject
      },
      participants: {
        maxUserNumber: 4,
        attendees: { 
          attendee: (() => {
            return attendees.map((attendee) => {
              return {
                person: {
                  name: attendee.displayName,
                  email: attendee.mail
                }
              }
            });
          })()
        }
      },
      enableOptions: { chat: true, poll: true, audioVideo: true },
      schedule: {
        startDate,
        openTime: 900,
        duration,
        timeZoneID: this.timeZones.find(tz => tz.timeZone === timeZone).timeZoneID
      }
    };
    return this.meetingHandler({
      xsiType,
      content: meeting,
      tagName: 'meetingkey',
      parser: 'getMeetingKey'
    });
  };

  service.joinUrls = function({ meetingKey, meetingPassword, attendee }) {
    const xsiType = `${xsitype}.meeting.GetjoinurlMeeting`;
    const content = {
      sessionKey: meetingKey,
      attendeeName: attendee.displayName,
      attendeeEmail: attendee.mail,
      meetingPW: meetingPassword
    };
    return this.meetingHandler({
      xsiType, content,
      tagName: 'joinMeetingURL',
      parser: 'parseJoinUrl'
    });
  };

  service.hostJoinUrl = function({ meetingKey }) {
    const xsiType = `${xsitype}.meeting.GethosturlMeeting`;
    return this.meetingHandler({
      xsiType,
      content: { sessionKey: meetingKey },
      tagName: 'hostMeetingURL',
      parser: 'parseJoinUrl'
    });
  };
 
  service.meetingHandler = function({xsiType, content, tagName, parser }) {
    return webex.js2xml(
      bodyBuilder(content)
    ).then((xml:string) => {
      return xsi(xml, xsiType);
    }).then((xml:string) => {
      return webex.genXml(xml);
    }).then((xml:string) => {
      console.log(xml);
      return webex._request({ body: xml});
    }).then((resp: any) => {
      let xml = resp;
      // console.log(xml);
      return processors.parseAuthResponse(xml).then((result: any) => {
        if(result && result.error) {
          return result;
        } else {
          return processors[parser](xml, tagName);
        }
      })
    });
  };

  service.timeZones = (() => {
    return [{
      timeZone: 'America/New_York', timeZoneID: 11
    }, {
      timeZone: 'America/Toronto', timeZoneID: 11
    }, {
      timeZone: 'America/Indianapolis', timeZoneID: 12
    }, {
      timeZone: 'America/Honolulu', timeZoneID: 2
    }, {
      timeZone: 'America/Chicago', timeZoneID: 7
    }, {
      timeZone: 'America/Denver', timeZoneID: 6
    }, {
      timeZone: 'America/Phoenix', timeZoneID: 5
    }, {
      timeZone: 'America/Los_Angeles', timeZoneID: 4
    }, {
      timeZone: 'America/Anchorage', timeZoneID: 3
    }];
  })() 

  return service;
}
