import * as Promise from 'bluebird';
import * as xml2js from 'xml2js';
import {  properties as Properties } from '../services';
import {
  userServFactory, meetingsServFactory
} from '../services';

import axios from 'axios';
import { stringify } from 'querystring'
import axiosCookieJarSupport from '@3846masa/axios-cookiejar-support';
import * as tough from 'tough-cookie';
axiosCookieJarSupport(axios);

import {
  MeetingService
} from '../models/WebEx';

const { Builder, parseString } = xml2js,
      xmlBuilder = new Builder({headless: true}),
      { webex: {
        headers, uri, siteName, xsi, schema
      } } = Properties;

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
  meetingsService: MeetingService;
  constructor({webExID, password}: any) {
    this.securityContext = {
      securityContext: { webExID, password, siteName }
    };
    this.userService = userServFactory(this);
    this.meetingsService = meetingsServFactory(this);
  };

  instantRequest(params:any) {
    let { loginUrl, meetingUrl, loginBody, meetingBody } = params;
    const cookieJar = new tough.CookieJar();
    axios.defaults.jar = cookieJar;
    axios.defaults.withCredentials = true;
    return axios.post(loginUrl, stringify(loginBody))
      .then((resp) => {
        // console.log(resp.data);
        const meetingForm = Object.keys(meetingBody).map(key =>
         `${encodeURI(key)}=${encodeURIComponent(meetingBody[key])}`).join('&');
        let meetUrl = meetingUrl + meetingForm;
        return axios.get(meetUrl)
      }).then((resp) => {
        let successFail = resp.data.match(/SUCCESS\\x26MK\\x3d(.\d+)\\x/);
        if(!successFail) return null;
        else return { meetingKey: successFail[1] };
      });
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

  _axiosrequest({body}) {
    return axios({
      url: uri,
      method: 'post',
      headers,
      data: body
    }).then(({data}) => data);
  };
}