import { Properties } from '../properties';
import * as Promise from 'bluebird';
import { WebEx } from '../lib/WebEx';
const { WebEx: { xsitype } } = Properties;
import { bodyBuilder, xsi, processors } from './index';

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

  service.create = function() {
    const xsiType = `${xsitype}.CreateMeeting`;
  };

  return service;
}
