import * as request from 'request';
import * as Promise from 'bluebird';
import * as xml2js from 'xml2js';
import { properties } from '../services/properties';
import {
  userServFactory, meetingsServFactory
} from '../services';

const { Builder, parseString } = xml2js,
      xmlBuilder = new Builder({headless: true}),
      { webex: {
        headers, uri, siteName, xsi, schema
      } } = properties;

export interface Credentials {
  securityContext: {
    webExID: string, password: string, siteName: string
  };
}

export interface UserServiceFactory {
  authenticate():Promise<any>;
  get(string): Promise<any>;
}

export interface MeetingServiceFactory {
  joinUrls(Object): Promise<any>;
  hostJoinUrl(Object): Promise<any>;
  meetingHandler(Object): Promise<any>;
  timeZone: Object[];
}

export class WebEx {
  securityContext: Credentials;
  userService: UserServiceFactory;
  meetingsService: MeetingServiceFactory;
  constructor({webExID, password}: any) {
    this.securityContext = {
      securityContext: { webExID, password, siteName }
    };
    this.userService = userServFactory(this);
    this.meetingsService = meetingsServFactory(this);
  };

  js2xml(o: Object) {
    return Promise.resolve((xmlBuilder.buildObject(o)));
  };

  genXml(bodyContent: string) {
    return Promise.resolve(
      `<?xml version="1.0" encoding="UTF-8"?>
        <serv:message xmlns:xsi="${xsi}" xsi:schemaLocation="${schema}">
          <header>
            ${xmlBuilder.buildObject(this.securityContext)}
          </header>
          <body>${bodyContent}</body>
        </serv:message>`
    );
  };

  _request(options: any) {
    return new Promise((resolve:any, reject:any) => {
      request.post({
        uri,
        headers,
        strictSSL: false,
        body: options.body
      }, (err: any, resp: any, body: any) => {
        // console.log(err);
        // console.log(body);
        resolve(body)
      });
    });
  };
}