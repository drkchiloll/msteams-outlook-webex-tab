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

  getMeetingKey(xml: string) {
    const doc = new dom().parseFromString(xml);
    return Promise.resolve({
      meetingKey: doc.getElementsByTagNameNS(
        'http://www.webex.com/schemas/2002/06/service/meeting',
        'meetingkey'
      )[0].textContent
    });
  },

  parseResult(domDoc: any) {
    return domDoc.getElementsByTagNameNS(
      'http://www.webex.com/schemas/2002/06/service',
      'result'
    )[0].textContent
  },

  parseJoinUrl(xml: string, tagName: string) {
    const doc = new dom().parseFromString(xml);
    let joinUrl: any = {};
    if(this.parseResult(doc) === 'FAILURE') {
      joinUrl.joinUrl = '';
    } else {
      joinUrl.joinUrl = doc.getElementsByTagNameNS(
        'http://www.webex.com/schemas/2002/06/service/meeting',
        tagName
      )[0].textContent;
    }
    return new Promise((resolve, reject) => resolve(joinUrl));
  },

  parseAuthResponse(xml:string) {
    const doc = new dom().parseFromString(xml);
    const result = doc.getElementsByTagNameNS(
      'http://www.webex.com/schemas/2002/06/service',
      'result'
    )
    return new Promise((resolve, reject) => {
      if(
        result && result.length > 0
      ) {
        resolve({ authentication: result[0].textContent });
      } else {
        resolve('unknown error');
      }
    });
  }
};
