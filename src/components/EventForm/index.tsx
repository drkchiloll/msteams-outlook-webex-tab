import * as React from 'react';
import {  Grid, Row, Col } from 'react-flexbox-grid';
import * as autobind from 'autobind-decorator';
import * as moment from 'moment';
import * as momenttz from 'moment-timezone';

import {
  RaisedButton, FontIcon, TextField,
  DatePicker, AutoComplete, MenuItem,
  IconButton
} from 'material-ui';

export class EventForm extends React.Component<any, any> {

  meetingProps(e: any, value: string) {
    let { name } = e.target;
    this.props.inputChange(name, value);
  }

  styles = {
    textField: {
      width: 400, maxWidth: 570
    }
  }

  render() {
    return (
      <div>
        <Row>
          <Col xs={12}><h3>New Meeting</h3>
            <IconButton
              style={{top: 0, right: 0, position: 'absolute' }}
              iconClassName='mdi mdi-close mdi-18px'
              onClick={() => {
                this.props.inputChange('newEvent', false);
              }} />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <TextField
              name='title'
              hintText='Title'
              style={this.styles.textField}
              onChange={this.meetingProps} />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <TextField
              name='location'
              hintText='Location'
              style={this.styles.textField}
              onChange={this.meetingProps} />
          </Col>
        </Row>
      </div>
    )
  }
}