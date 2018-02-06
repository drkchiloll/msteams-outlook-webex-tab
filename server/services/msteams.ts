import { MsGraph } from '../lib';
import { properties } from './index';
const {msApp: { baseUrl }} = properties;

export function MsTeamsServiceFactory(graph: MsGraph): any {
  const service: any = {};

  service.postActionCard = function (actions, organizer) {
    let card: any = {
      summary: 'New Action Card',
      themeColor: '0078D7',
      title: `${organizer.displayName} has started a New Cisco WebEx Conference`,
      sections: [{
        images: [{image: `${baseUrl}/webex.jpg`, text: 'alt text'}],
        text: 'To Automatically Join the Web Conference already in progress click on the Join Button.'
      }],
      potentialAction: actions
    };
    return graph.connector(card);
  };

  return service;
}