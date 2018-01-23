import * as React from 'react';
import {  Grid, Row, Col } from 'react-flexbox-grid';
import autobind from 'autobind-decorator';
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
          <Col xs={12}>
            <TextField
              name='title'
              hintText='Title'
              style={this.styles.textField}
              onChange={(e, value) =>
                this.props.inputChange('title', value)} />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <TextField
              name='location'
              hintText='Location'
              style={this.styles.textField}
              onChange={(e, value) =>
                this.props.inputChange('location', value)} />
          </Col>
        </Row>
      </div>
    )
  }
}