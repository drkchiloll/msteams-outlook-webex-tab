import * as Promise from 'bluebird';
import { WebEx } from '../lib/WebEx';
import { properties } from './properties';
const { webex: { xsitype }} = properties;

import { xsi, bodyBuilder, processors } from './index';

export function userServFactory(webex: WebEx) {
  const service: any = {};

  service.userHandler = function({ xsiType, content }) {
    return webex.js2xml(
      bodyBuilder(content)
    ).then((xml: string) => {
      return xsi(xml, xsiType);
    }).then((xml: string) => {
      return webex.genXml(xml.replace('/', '').replace(/\>/i, '/>'));
    }).then((xml: string) => {
      return webex._axiosrequest({ body: xml });
    }).then((xmlResp: string) => xmlResp);
  };

  service.authenticate = function(web:any) {
    const xsiType = `${xsitype}.user.AuthenticateUser`;
    return this.userHandler({
      xsiType, content: {}
    }).then((xml: string) => {
      return processors.parseAuthResponse(xml);
    });
  };

  service.get = function(user: string) {
    return webex.js2xml(
      bodyBuilder({ webExId: user })
    ).then((query: string) => {
      return xsi(query, `${xsitype}.user.GetUser`);
    }).then((query: string) => {
      return webex.genXml(query);
    }).then((xml:string) => {
      console.log(xml);
      return webex._axiosrequest({body: xml});
    });
  };

  return service;
};