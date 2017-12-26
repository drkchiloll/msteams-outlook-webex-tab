import { MsGraph } from '../lib';

export function outlookServFactory(graph: MsGraph) {
  const service: any = {};

  service.createEvent = function(body: any) {
    /*
      {
        subject: Event Title
        body: {contentType: html, content: Message},
        start: {dateTime: 2017-04-15T12:00:00, timeZone: Pacific Standard Time},
        end: {same as above},
        location: { displayName: Name },
        attendees: [{
          emailAddress: {address: me@example.com, name: Me},
          type: required|optional|resource
        }]
      }
    */
    return graph._request({
      body,
      method: 'post',
      path: '/beta/me/events'
    });
  };

  return service;
};