import * as request from 'request';
import * as Primise from 'bluebird';
import { outlookServFactory } from '../services';
import { Properties } from '../properties';

const { MsGraph: { uri, headers }} = Properties;

export class MsGraph {
  outlookService: any;
  constructor({ token }) {
    this.outlookService = outlookServFactory(this);
    headers['Auhorization'] = `Bearer ${token}`;
  }

  _request({body, method, path}) {
    return new Promise((resolve, reject) => {
      request({
        uri: uri + path,
        headers,
        method,
        body
      }, (err, resp, body) => {
        return resolve(body);
      });
    });
  }
}