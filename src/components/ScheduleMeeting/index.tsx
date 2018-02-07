import * as React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import {
  Dialog, FlatButton, Subheader, Menu, CircularProgress
} from 'material-ui';
import { EventDates, EventForm, UserSearch, Participant } from '../index';

export class ScheduleMeeting extends React.Component<any,any> {
  dialogActions = () => [
    <FlatButton label='Cancel' primary={true}
      onClick={() => this.props.formHandler('newEvent', false)} />,
    <FlatButton
      label={
        this.props.buttonLabel ||
        <i className='mdi mdi-rotate-right mdi-spin mdi-18px' />} 
      disabled={!this.props.newMeeting.title}
      onClick={this.props.create} />
  ];

  render() {
    const {
      newMeeting, formHandler, buttonLabel,
      create, api, admin, attendees, remove, add
    } = this.props;
    return (
      <Dialog open={true}
        modal={false}
        title='Schedule New Meeting'
        autoDetectWindowHeight={true}
        autoScrollBodyContent={true}
        style={{position:'relative', maxWidth:'none', top:0}}
        actions={this.dialogActions()} >
        <Grid>
          <EventForm inputChange={formHandler} />
          <EventDates inputChange={formHandler} {...newMeeting} api={api} />
          <Row>
            <Col xsOffset={6} xs={5}>
              <div style={{marginTop:'5px'}}>
                <Subheader>Organizer</Subheader>
                { admin ? <Participant user={admin} /> : null }
                <Menu maxHeight={200}>
                  <Subheader> Participants </Subheader>
                  { attendees.map((part:any) => 
                     <Participant key={part.id} user={part} remove={remove} />)}
                </Menu>
              </div>
            </Col>
          </Row>
          <Row>
            <Col sm={12}>
              <div style={{position:'absolute',top:285, width:'37%'}}>
                <UserSearch api={api} addAttendee={add} />
              </div>
            </Col>
          </Row>
        </Grid>
      </Dialog>
    )
  }
}