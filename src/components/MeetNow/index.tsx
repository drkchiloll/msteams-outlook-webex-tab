import * as React from 'react';
import * as Promise from 'bluebird';
import * as moment from 'moment';
import * as momenttz from 'moment-timezone';
import { Grid, Row, Col } from 'react-flexbox-grid';
import autobind from 'autobind-decorator';
import {
  Dialog, FlatButton, FontIcon, TextField,
  CircularProgress, RaisedButton
} from 'material-ui';

import { Participant } from '../Participant';

import { Api } from '../../middleware'

export class WebExMeetNowDialog extends React.Component<any,any> {
  state = {
    dialogOpen: false,
    cards: [],
    members: null,
    agenda: '',
    launchBtn: 'LAUNCH'
  }

  @autobind
  removeParticipant(cardIndex) {
    let { cards, members } = this.state;
    cards.splice(cardIndex, 1);
    this.setState({ cards });
  }

  componentWillReceiveProps(props) {
    this.props.api.msteamsMembers().then((members: any) => {
      this.setState({ members })
      this._renderCards(JSON.parse(JSON.stringify(members)));
    })
  }

  @autobind
  _renderCards(members) {
    let cards = members
      .map((member, i) => (
        <Participant user={member} index={i} remove={this.removeParticipant} />
      ))
    this.setState({ cards });
  }

  @autobind
  launchMeeting() {
    const api: Api = this.props.api;
    this.setState({ launchBtn: '' });
    let { members } = this.state;
    const webex = { ...api.webex };
    let organizer = members.find((mem) => mem.me);
    delete organizer.photo;

    let webExMeeting = api.webExGenerateMeetingRequest({
      subject: 'Microsoft Teams Web Conference',
      attendees: (() => {
        return members.reduce((a, member) => {
          if(member.me) return a;
          else {
            a.push({ id: member.id, displayName: member.displayName, mail: member.mail });
            return a;
          }
        }, [])
      })(),
      startDate: new Date(),
      duration: null,
    });
    let key: string, hostJoinUrl;
    return api
      .webExCreateMeeting(webExMeeting)
      .then(({meetingKey}) => {
        key = meetingKey;
        // Get Host JoinURL
        return api.webExGetJoinUrl({
          host: true,
          meetingKey: key
        })
      }).then(({ joinUrl }) => {
        hostJoinUrl = joinUrl;
        let { attendees } = webExMeeting.meeting;
        return Promise.map(attendees, ({ displayName, mail }) => {
          return api.webExGetJoinUrl({
            host: false,
            meetingKey: key,
            attendee: { displayName, mail }
          }).then(({ joinUrl }) => {
            return {
              '@type': 'OpenUri',
              name: displayName,
              targets: [{ os: 'default', uri: joinUrl }]
            };
          });
        }).then((actionCards) => {
          return api.msteamsDialogBuilder(actionCards, organizer);
        });
      }).then(() => {
        this.setState({ cards: [], members: null, launchBtn: 'LAUNCH' });
        this.setState({ dialogOpen: false });
        window.open(hostJoinUrl, '_newtab');
      });
  }

  render() {
    let { api } = this.props;
    return (
      <div>
        <FlatButton
          fullWidth={true}
          style={{ width: 285}}
          disabled={!api.webex.webExId || !api.webex.webExPassword}
          backgroundColor='white'
          label={
            <span className='mdi mdi-cisco-webex mdi-24px'
              style={{ color: 'rgb(96,146,67)', fontSize: '1.1em' }} >
              &nbsp;&nbsp;Meet Now&nbsp;&nbsp;
              <span className='mdi mdi-cisco-webex mdi-24px' />
            </span>
          }
          onClick={() => this.setState({ dialogOpen: true })} />
        <Dialog title='Cisco WebEx "Instant" Meeting'
          actions={[
            <FlatButton label='Cancel' primary={true} onClick={() => this.setState({ dialogOpen: false })} />,
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
          style={{position: 'fixed', height: 'auto', width: 1250}} >
          <Grid>
            <Row>
              <Col sm={6}>
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
            </Row>
            <Row>
              <Col sm={12}>
                <div style={{display: this.state.members ? 'none': 'inline-block', marginTop: '20px'}}>
                  <CircularProgress size={20} thickness={3} />
                </div>
              </Col>
            </Row>
            <Row>
              {this.state.cards}
            </Row>
          </Grid>
        </Dialog>
      </div>
    )
  }
}