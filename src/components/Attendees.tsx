import * as React from 'react';
import autobind from 'autobind-decorator';
import {
  Paper, IconButton, Avatar
} from 'material-ui';
import { Grid, Row, Col } from 'react-flexbox-grid';

export class Attendees extends React.Component<any, any> {
  styles = {
    paper: {
      display: 'inline-block',
      margin: '0 32px 16px 0',
      width: 250
    }
  }

  render() {
    const { organizer, attendees } = this.props;
    let participants: any;
    let type: string;
    if(organizer) {
      type = 'Organizer';
      participants = [organizer];
    } else if(attendees && attendees.length > 0) {
      type = 'Unknown';
      participants = attendees;
    }
    console.log(participants);
    return (
      !participants ?
        <div></div> :
        participants.map(({id, displayName, mail, photo}:any) => {
          return (
            <Paper style={this.styles.paper} key={id}>
              <div style={{margin: '10px 5px 10px 10px'}}>
                <Row>
                  <Col xs={3}>
                    {/* <Avatar src={photo || ''} /> */}
                  </Col>
                  <Col xs={8}>
                    <Row><Col xs={9}>{displayName}</Col></Row>
                    <Row><Col xs={3}><em>{type}</em></Col></Row>
                  </Col>
                </Row>
              </div>
            </Paper>
          )
        })
      )
  }
}