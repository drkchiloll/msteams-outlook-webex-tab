import { MsGraph } from '../lib';
import * as Promise from 'bluebird';
import {
  ChatMessage, MSTeamsService
} from '../models';

export function MsTeamsServiceFactory(graph: MsGraph): MSTeamsService {
  const service: any = {};

  service.listMembers = function(id) {
    return graph._request({
      method: 'get',
      path: `/beta/groups/${id}/members`,
      body: {}
    });
  };

  service.postActionCard = function (actions, organizer) {
    let card: any = {
      summary: 'New Action Card',
      themeColor: '0078D7',
      title: `${organizer.displayName} has started a New Cisco WebEx Conference`,
      sections: [{
        images: [{image: 'https://msteams-webex.ngrok.io/webex.jpg', text: 'alt text'}],
        text: 'To Automatically Join the Web Conference already in progress click on the Join Button.'
      }],
      potentialAction: actions
    };
    // console.log(card);
    return graph.connectorRequest(card);
  };

  return service;
}

export { MSTeamsService };
