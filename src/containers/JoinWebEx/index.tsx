import * as React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { FlatButton } from 'material-ui';

export class JoinWebEx extends React.Component<any,any> {
  constructor(props) {
    super(props);
    microsoftTeams.initialize()
  }

  isEncoded(uri) {
    uri = uri || '';
    return uri !== decodeURIComponent(uri);
  }

  fullyDecodedUri(uri) {
    while(this.isEncoded(uri)) {
      uri = decodeURIComponent(uri);
    }
    return uri;
  }

  componentWillMount() {
    microsoftTeams.getContext(({upn, subEntityId}) => {
      if(subEntityId) {
        // An "Instant" Meeting was Launched and the Team Member Clicked
        // On the Join Conference Meeting
        const entities: any = subEntityId;
        const entity = entities.find(entity => entity.mail === upn);
        if(entity) {
          let joinUrl = this.fullyDecodedUri(entity.joinUrl);
          window.open(joinUrl, '_newTab');
        }
      }
    });
  }

  render() {
    return (
      <FlatButton label='JOIN WEBEX'
        style={{margineLeft: 500, display: 'none'}}
        labelPosition='after'
        icon={<i className='mdi mdi-cisco-webex mdi-24px' />} />
    )
  }
}