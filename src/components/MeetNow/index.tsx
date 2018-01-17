import * as React from 'react';
import * as Promise from 'bluebird';
import * as moment from 'moment';
import * as momenttz from 'moment-timezone';
import { Grid, Row, Col } from 'react-flexbox-grid';
import autobind from 'autobind-decorator';
import {
  Dialog, FlatButton, FontIcon, TextField,
  CircularProgress, RaisedButton, Subheader,
  List, Menu
} from 'material-ui';

import { Participant } from '../Participant';
import { UserSearch } from '../UserSearch';

import { Api } from '../../middleware';

const initialState = {
  dialogOpen: false,
  members: null,
  agenda: '',
  launchBtn: 'LAUNCH',
  attendees: [],
  organizer: {}
};

export class WebExMeetNowDialog extends React.Component<any,any> {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      members: null,
      agenda: '',
      launchBtn: 'LAUNCH',
      attendees: [],
      organizer: {}
    };
  }

  @autobind
  removeParticipant(attendeeId) {
    let { attendees } = this.state;
    let idx = attendees.findIndex(attendee => 
      attendee.id === attendeeId);
    attendees.splice(idx, 1);
    this.setState({ attendees });
  }

  @autobind
  launchMeeting() {
    this.setState({ launchBtn: '' });
    const api: Api = this.props.api;
    let key: string, hostJoinUrl: string;
    return api
      .webExLaunchPersonalRoom()
      .then(({meetingKey}) => {
        key = meetingKey;
        return api.webExGetJoinUrl({host: true, meetingKey: key });
      })
      .then(({joinUrl}) => {
        hostJoinUrl = joinUrl;
        return;
      })
      .then(() => {
        let { attendees, organizer } = this.state;
        delete organizer.photo;
        return Promise.map(attendees, ({displayName, mail}) => {
          return api.webExGetJoinUrl({
            host: false,
            meetingKey: key,
            attendee: { displayName, mail}
          }).then(({joinUrl}) => ({mail, joinUrl}))
        }).then(subEntityId => 
          api.msteamsDialogBuilder(subEntityId, organizer))
      }).then(() => {
        this.resetState();
        window.open(hostJoinUrl, '_newTab');
      })
  }

  @autobind
  getTeam() {
    this.setState({ dialogOpen: true });
    this.props.api.msteamsMembers().then((members: any) => {
      let organizer = members.find(member => member.me);
      members.splice(
        members.findIndex(mem => mem.me), 1
      );
      const attendees = members;
      this.setState({ organizer, members, attendees });
    });
  }

  @autobind
  resetState() {
    this.setState(initialState);
  }

  render() {
    let api: Api = this.props.api;
    let {webex} = this.props;
    const { attendees, organizer } = this.state;
    // The Other Way Mutates ways in which ATTENDEES are modified to
    // React DOM Elements
    const admin = <Participant user={JSON.parse(JSON.stringify(organizer))} />;
    // const participants = JSON.parse(JSON.stringify(attendees)).map((attendee) =>
    //   <Participant user={attendee} key={attendee.id}
    //     remove={this.removeParticipant} />)
    return (
      <div>
        <RaisedButton
          fullWidth={true}
          style={{ width: 285}}
          disabled={!webex.webExId || !webex.webExPassword}
          backgroundColor='rgb(95,166,80)'
          labelColor='black'
          label='START MEETING'
          labelPosition='after'
          icon={<i className='mdi mdi-cisco-webex mdi-18px'
            style={{
              color: 'black',
              fontSize: '1.1em' }} />}
          onClick={this.getTeam} />
        <Dialog title='Cisco WebEx Instant Meeting'
          actions={[
            <FlatButton label='Cancel' primary={true} onClick={() => {
              this.resetState();
            }} />,
            <FlatButton
              label={
                this.state.launchBtn ||
                <i className='mdi mdi-rotate-right mdi-spin mdi-24px' 
                  style={{ verticalAlign: 'middle', color: '#EDE7F6' }} />
              }
              primary={true}
              onClick={this.launchMeeting} />
          ]}
          modal={false}
          open={this.state.dialogOpen}
          style={{
            position: 'relative',
            height: 'auto', maxWidth: 'none', width: '100%'
          }}
          autoScrollBodyContent={true} >
          <Grid>
            <Row>
              <Col sm={5}>
                <TextField
                  value={this.state.agenda}
                  floatingLabelText='Meeting Agenda'
                  floatingLabelFocusStyle={{fontSize: '1.5em'}}
                  hintText='Optional Agenda Description'
                  multiLine={true}
                  fullWidth={true}
                  autoFocus
                  onChange={(e, value) => {
                    this.setState({ agenda: value });
                  }}
                  rows={3} />
              </Col>
              <Col sm={7}>
                <div style={{ marginLeft: '75px' }}>
                  <Subheader> Organizer </Subheader>
                  {admin}
                  <Menu maxHeight={400} >
                    <Subheader> Participants </Subheader>
                    { attendees.length===0 ? <div></div> :
                      JSON.parse(JSON.stringify(attendees)).map((att:any) =>
                        <Participant user={att} key={att.id} remove={this.removeParticipant} />)}
                  </Menu>
                </div>
              </Col>
            </Row>
            <Row>
              <Col sm={12}>
                <div style={{
                    position: 'absolute',
                    top: 215,
                    width: '37%',
                    // display: this.state.members ? 'none': 'inline-block',
                    marginTop: 0
                  }}>
                  {/* <CircularProgress size={20} thickness={3} /> */}
                  <UserSearch />
                </div>
              </Col>
            </Row>
          </Grid>
        </Dialog>
      </div>
    )
  }
}