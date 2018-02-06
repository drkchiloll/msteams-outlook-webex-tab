import * as React from 'react';
import { Row, Col } from 'react-flexbox-grid';
import autobind from 'autobind-decorator';
import {
  Avatar, IconButton, CardActions, 
  Paper, ListItem, Divider
} from 'material-ui';

export class Participant extends React.Component<any,any> {
  render() {
    let { user } = this.props;
    if(user.photo) {
      let img = `data:image/jpeg;base64,${new Buffer(user.photo, 'binary').toString('base64')}`;
      user.photo = <Avatar src={img} />;
    } else {
      user.photo = (
        <Avatar color='#D1C4E9' backgroundColor='#673AB7'>
          {user.displayName.split(' ')[0].substring(0,1).toUpperCase()+
           user.displayName.split(' ')[1].substring(0,1).toUpperCase()}
        </Avatar>
      );
    }
    return (
      <Row>
        <Col xs={12}>
          <Paper style={{
            position: 'relative',
            margin: '5px 5px 5px 1px',
            width: 265
          }}>
              <ListItem
                disabled={true}
                leftAvatar={user.photo}
                innerDivStyle={{marginBottom: '2px'}}
                primaryText={user.displayName}
                secondaryText={
                  <strong style={{fontSize:'75%'}}>{user.mail}</strong>
                }
              />
            <IconButton
              style={{
                display: user.me ? 'none' : 'inline-block',
                position: 'absolute', right: 0, top: 0
              }}
              iconClassName='mdi mdi-close mdi-18px'
              onClick={() => {
                this.props.remove(user.id);
              }} />
          </Paper>
        </Col>
      </Row>
    );
  }
}