import * as Promise from 'bluebird';
import { DOMParser as dom } from 'xmldom';

export const processors = {

  meetings(xml: string, tagName: string) {
    const doc = new dom().parseFromString(xml);
    let meetings = Array.from(doc.getElementsByTagName(tagName));
    return Promise.map(meetings, meeting => {
      return Array.from(meeting.childNodes).reduce((o, child) => {
        o[child.nodeName] = child.textContent;
        return o;
      }, {});
    }).then((result) => {
      return { meetings: result }
    });
  },
  
  attendees(xml: string) {
    return Promise.map(
      Array.from(new dom().parseFromString(xml).getElementsByTagName('email')),
      ({ textContent }: any) => textContent
    ).then((attendees: string[]) => ({ attendees }));
  },

  createMeetingResponse: (
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<serv:message xmlns:serv=\"http://www.webex.com/schemas/2002/06/service\" xmlns:com=\"http://www.webex.com/schemas/2002/06/common\" xmlns:meet=\"http://www.webex.com/schemas/2002/06/service/meeting\" xmlns:att=\"http://www.webex.com/schemas/2002/06/service/attendee\"><serv:header><serv:response><serv:result>SUCCESS</serv:result><serv:gsbStatus>PRIMARY</serv:gsbStatus></serv:response></serv:header><serv:body><serv:bodyContent xsi:type=\"meet:createMeetingResponse\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"><meet:meetingkey>157564097</meet:meetingkey><meet:iCalendarURL><serv:host>https://wwtatc.webex.com/wwtatc/j.php?MTID=m5eb680b6bdb20e8cd9f7a98e68d598e3</serv:host><serv:attendee>https://wwtatc.webex.com/wwtatc/j.php?MTID=m6f0af39aee7d8467db837fe989cb5b71</serv:attendee></meet:iCalendarURL><meet:guestToken>28c3503aae7745b177bf35f790e42985</meet:guestToken></serv:bodyContent></serv:body></serv:message>"
  ),

  getMeetingKey(xml: string) {
    const doc = new dom().parseFromString(xml);
    return Promise.resolve({
      meetingKey: doc.getElementsByTagNameNS(
        'http://www.webex.com/schemas/2002/06/service/meeting',
        'meetingkey')[0].textContent
    });
  },

  parseJoinUrl(xml: string, tagName: string) {
    const doc = new dom().parseFromString(xml);
    return Promise.resolve({
      joinUrl: doc.getElementsByTagNameNS(
        'http://www.webex.com/schemas/2002/06/service/meeting',
        tagName
      )[0].textContent
    });
  },

  parseForFailure(xml:string) {
    const doc = new dom().parseFromString(xml);
    const result = doc.getElementsByTagNameNS(
      'http://www.webex.com/schemas/2002/06/service',
      'reason'
    )
    return new Promise((resolve, reject) => {
      if(result && result.length === 0) return resolve(true);
      if(result[0].textContent === 'Incorrect user or password') {
        return resolve({ error: 'authentication' });
      }
    });
  }


};
