import * as Promise from 'bluebird';
import { WebEx } from '../lib/WebEx';
import { properties } from './properties';
const { webex: { xsitype }} = properties;

import { xsi, bodyBuilder } from './index';

export function userServFactory(webex: WebEx) {
  const service: any = {};

  service.get = function(user: string) {
    return webex.js2xml(
      bodyBuilder({ webExId: user })
    ).then((query: string) => {
      return xsi(query, `${xsitype}.user.GetUser`);
    }).then((query: string) => {
      return webex.genXml(query);
    }).then((xml:string) => {
      console.log(xml);
      return webex._request({body: xml});
    });
  };

  return service;
};