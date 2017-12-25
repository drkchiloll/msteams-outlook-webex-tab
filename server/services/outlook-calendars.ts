export function outlookServFactory(graph: any) {
  const service: any = {};

  service.createEvent = function() {
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
  };

  return service;
};