import * as React from 'react';
import * as Promise from 'bluebird';
import { Participant, UserSearch } from '../index';
import { Api } from '../../middleware';
import { Grid, Row, Col } from 'react-flexbox-grid';
import {
  Dialog, FlatButton, List, TextField,
  CircularProgress, Subheader, Menu
} from 'material-ui';

const initialState = {
  members: null,
  agenda: '',
  launchBtn: 'LAUNCH',
  attendees: [],
  organizer: {}
};

export class WebExMeetNowDialog extends React.Component<any,any> {

  state = JSON.parse(JSON.stringify(initialState));

  componentWillMount() {
    if(this.props.dialogOpen) this.getTeam();
  }

  removeParticipant = (attendeeId) => {
    let { attendees } = this.state;
    let idx = attendees.findIndex(attendee => 
      attendee.id === attendeeId);
    attendees.splice(idx, 1);
    this.setState({ attendees });
  }

  addParticipant = (attendee) => {
    let { attendees }  = this.state;
    attendees.unshift(attendee);
    this.setState({ attendees });
  }

  launchMeeting = () => {
    this.setState({ launchBtn: '' });
    let { attendees, organizer } = this.state;
    const api: Api = this.props.api;
    let key: string, hostJoinUrl: string;
    return api
      .webExLaunchPersonalRoom(attendees)
      .then(({meetingKey}:any) => {
        key = meetingKey;
        return api.webExGetJoinUrl({host: true, meetingKey: key});
      })
      .then(({joinUrl}) => {
        hostJoinUrl = joinUrl;
        return;
      })
      .then(() => {
        delete organizer.photo;
        return Promise.map(attendees, ({displayName, mail}) => {
          return api.webExGetJoinUrl({
            host: false,
            meetingKey: key,
            attendee: { displayName, mail},
            meetingType: 'personal'
          }).then(({joinUrl}) => ({mail, joinUrl}))
        }).then(subEntityId =>
          api.msteamsDialogBuilder(subEntityId, organizer))
      }).then(() => {
        this.setState(initialState);
        this.props.close();
        window.open(hostJoinUrl, '_newtab');
      })
  }

  getTeam = () => {
    const api: Api = this.props.api;
    this.setState({ dialogOpen: true });
    api.graphService.getTeam()
      .then((members:any) => {
        let organizer = members.find(member => member.me);
        members.splice(
          members.findIndex(mem => mem.me), 1
        );
        const attendees = members;
        this.setState({ organizer, members, attendees });
      });
  }

  render() {
    const { attendees, organizer } = this.state;
    return (
      <div style={{ position: 'relative' }}>
        <Dialog title='Cisco WebEx Instant Meeting'
          actions={[
            <FlatButton label='Cancel' primary={true} onClick={() => {
              this.setState(initialState);
              this.props.close();
            }} />,
            <FlatButton
              label={
                this.state.launchBtn ||
                <i className='mdi mdi-rotate-right mdi-spin mdi-24px' 
                  style={{ verticalAlign: 'middle', color: '#673AB7' }} />
              }
              primary={true}
              onClick={this.launchMeeting} />
          ]}
          modal={false}
          open={true}
          style={{
            maxWidth: 'none', width: '100%', height: 600
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
                  <div style={{ marginLeft: '20px', display: organizer.id ? 'none': 'inline' }}>
                    <CircularProgress size={15} />
                  </div>
                  <Subheader> Organizer </Subheader>
                  { organizer.id && organizer.displayName && organizer.mail ?
                    <Participant user={JSON.parse(JSON.stringify(organizer))} /> :
                    <div></div> }
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
                  marginTop: 0
                }}>
                  <UserSearch api={this.props.api} addAttendee={this.addParticipant} />
                </div>
              </Col>
            </Row>
          </Grid>
        </Dialog>
      </div>
    )
  }
}