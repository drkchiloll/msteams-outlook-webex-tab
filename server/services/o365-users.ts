import { MsGraph } from '../lib';
import * as Promise from 'bluebird';

export interface User {
  id: string;
  mail: string;
  displayName: string;
  photo?: Buffer;
}

export function o365UserServFactory(graph: MsGraph) {
  const service: any = {};

  service._constructFilter = (user) =>
    `filter=startsWith(displayName,'${user}') `+
    `or startsWith(surname,'${user}')&select=displayName,mail,id`;

  service.get = function(user) {
    return graph._request({
      method: 'get',
      path: `/beta/users?${this._constructFilter(user)}`,
      body: {}
    });
  };

  service.getMe = function() {
    return graph._request({
      method: 'get',
      path: '/beta/me',
      body: {}
    });
  }

  service.getPhoto = function(id) {
    let method = 'get',
        body = {},
        path = `/beta/users/${id}/photo`;
    return graph._request({
      method,
      path,
      body
    }).then((resp: any) => {
      if(resp && resp.id !== '1x1') {
        return graph._request({
          method,
          body,
          path: path + `s/${resp.id}/$value`
        });
      } else {
        return null;
      }
    });
  };

  return service;
}