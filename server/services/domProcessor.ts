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
  }
};
