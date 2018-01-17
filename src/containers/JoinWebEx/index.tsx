import * as React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import autobind from 'autobind-decorator';
import {
  FlatButton, Card, CardHeader
} from 'material-ui';

export class JoinWebEx extends React.Component<any,any> {
  constructor(props) {
    super(props);
    microsoftTeams.initialize()
  }

  componentWillMount() {
    microsoftTeams.getContext(({upn, subEntityId}) => {
      if(subEntityId) {
        // An "Instant" Meeting was Launched and the Team Member Clicked
        // On the Join Conference Meeting
        const entities: any = subEntityId;
        if(entities.find(entity => entity.mail == upn)) {
          let joinUrl = decodeURIComponent(entities.find(entity => entity.mail == upn).joinUrl)
          window.open(joinUrl, '_newTab');
        }
      }
    });
  }

  render() {
    return (
      <FlatButton label='JOIN WEBEX'
        style={{margineLeft: 500}}
        labelPosition='after'
        icon={<i className='mdi mdi-cisco-webex mdi-24px' />} />
    )
  }
}