import * as React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import autobind from 'autobind-decorator';
import * as moment from 'moment';
import * as momenttz from 'moment-timezone';

import { time } from '../../middleware';

import {
  RaisedButton, FontIcon, TextField,
  DatePicker, MenuItem, SelectField,
  DropDownMenu, Subheader
} from 'material-ui';

export class EventDates extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = { endDate: new Date() }
  }

  styles = {
    heading: {},
    datePicker: {
      marginLeft: 8
    },
    selectField: {
      marginLeft: 10
    },
    dropDownMenu: {
      width: 150, margin: 0, padding: 0
    }
  }

  @autobind
  durationChangeHandler(e:any, index: number, value: string) {
    let { startTime } = this.props,
        dateFormat = 'YYYY-MM-DD',
        startDate = moment().format(dateFormat);
    const formattedDate = moment(time.formatTime(startDate, startTime));
    this.durationValue = value;
    if(value === '1 hour') value = '1 hours';
    if(value === '1.5 hours') value = '90 minutes';
    let duration: any = parseInt(value.split(' ')[0], 10),
        ordinal: any = value.split(' ')[1];
    const timeDuration = formattedDate.add(duration, ordinal).format('h:mm a');
    this.props.inputChange('endTime', timeDuration);
  }

  durationValue = '30 minutes';

  render() {
    let { startTime, endTime, startDate, endDate, api } = this.props;
    return (
      <div style={{ position: 'relative' }}>
        <Row>
          <Col xs={12}>
            <Row>
              <Col sm={1}><h4>Start:</h4></Col>
              <Col sm={3}>
                <DatePicker
                  style={this.styles.datePicker}
                  defaultDate={new Date(startDate)}
                  hintStyle={{ color: '#9575CD' }}
                  fullWidth={true}
                  container='inline'
                  mode='portrait'
                  formatDate={(date: Date) => {
                    return moment(date).format('MM/DD/YYYY');
                  }}
                  autoOk={true}
                  onChange={(err: any, date: Date) => {
                    this.setState({ endDate: date });
                    this.props.inputChange(
                      'startDate', time.dateFormatter(date)
                    );
                    this.props.inputChange(
                      'endDate', time.dateFormatter(date)
                    )
                  }} />
              </Col>
              <Col sm={3}>
                <SelectField
                  value={(() => {
                    return startTime || (() => {
                      let start = moment();
                      let remainder = 30 - (start.minute() % 30);
                      return this.props.inputChange(
                        'startTime',
                        moment(start).add(remainder, 'minutes').format('h:mm a')
                      )
                    })()
                  })()}
                  fullWidth={true}
                  onChange={(e: any, key: number, value: string) => {
                    this.props.inputChange('startTime', value);
                    setTimeout(() => {
                      this.durationChangeHandler(null, null, this.durationValue);
                    }, 100);
                  }}>
                  {this.menuItems()}
                </SelectField>
              </Col>
            </Row>
            <Row>
              <Col sm={1}><h4>End:</h4></Col>
              <Col sm={3}>
                <DatePicker
                  style={this.styles.datePicker}
                  value={this.state.endDate}
                  hintStyle={{ color: '#9575CD' }}
                  fullWidth={true}
                  container='inline'
                  mode='portrait'
                  formatDate={(date: Date) => {
                    return moment(date).format('MM/DD/YYYY');
                  }}
                  autoOk={true}
                  onChange={(err: any, date: Date) => {
                    this.setState({ endDate: date })
                    this.props.inputChange(
                      'endDate', time.dateFormatter(date)
                    );
                  }} />
              </Col>
              <Col sm={3}>
                <SelectField
                  value={(() => {
                    return endTime || (() => {
                      let start = moment();
                      let remainder = 30 - start.minute() % 30;
                      return this.props.inputChange(
                        'endTime',
                        moment(start).add((remainder + 30), 'minutes').format('h:mm a')
                      )
                    })()
                  })()}
                  fullWidth={true}
                  onChange={(e: any, key: number, value: string) => {
                    this.props.inputChange('endTime', value);
                  }} >
                  {this.menuItems()}
                </SelectField>
              </Col>
            </Row>
            <Row>
              <Col smOffset={7} sm={3}>
                <h4 style={{ position: 'absolute', top: 15, marginLeft: 20 }}>Duration</h4>
              </Col>
            </Row>
            <Row>
              <Col smOffset={7} sm={2}>
                <SelectField value={this.durationValue}
                  style={{
                    position: 'absolute', top: 50,
                    width: 135, marginLeft: 20
                  }}
                  onChange={this.durationChangeHandler}>
                  {this.durationItems()}
                </SelectField>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  }

  menuItems() {
    return [
      <MenuItem key={`time_0`} value={'12:00 am'} primaryText={'12:00 am'} />,
      <MenuItem key={`time_1`} value={'12:30 am'} primaryText={'12:30 am'} />,
      <MenuItem key={`time_2`} value={'1:00 am'} primaryText={'1:00 am'} />,
      <MenuItem key={`time_3`} value={'1:30 am'} primaryText={'1:30 am'} />,
      <MenuItem key={`time_4`} value={'2:00 am'} primaryText={'2:00 am'} />,
      <MenuItem key={`time_5`} value={'2:30 am'} primaryText={'2:30 am'} />,
      <MenuItem key={`time_6`} value={'3:00 am'} primaryText={'3:00 am'} />,
      <MenuItem key={`time_7`} value={'3:30 am'} primaryText={'3:30 am'} />,
      <MenuItem key={`time_8`} value={'4:00 am'} primaryText={'4:00 am'} />,
      <MenuItem key={`time_9`} value={'4:30 am'} primaryText={'4:30 am'} />,
      <MenuItem key={`time_10`} value={'5:00 am'} primaryText={'5:00 am'} />,
      <MenuItem key={`time_11`} value={'5:30 am'} primaryText={'5:30 am'} />,
      <MenuItem key={`time_12`} value={'6:00 am'} primaryText={'6:00 am'} />,
      <MenuItem key={`time_13`} value={'6:30 am'} primaryText={'6:30 am'} />,
      <MenuItem key={`time_14`} value={'7:00 am'} primaryText={'7:00 am'} />,
      <MenuItem key={`time_15`} value={'7:30 am'} primaryText={'7:30 am'} />,
      <MenuItem key={`time_16`} value={'8:00 am'} primaryText={'8:00 am'} />,
      <MenuItem key={`time_17`} value={'8:30 am'} primaryText={'8:30 am'} />,
      <MenuItem key={`time_18`} value={'9:00 am'} primaryText={'9:00 am'} />,
      <MenuItem key={`time_19`} value={'9:30 am'} primaryText={'9:30 am'} />,
      <MenuItem key={`time_20`} value={'10:00 am'} primaryText={'10:00 am'} />,
      <MenuItem key={`time_21`} value={'10:30 am'} primaryText={'10:30 am'} />,
      <MenuItem key={`time_22`} value={'11:00 am'} primaryText={'11:00 am'} />,
      <MenuItem key={`time_23`} value={'11:30 am'} primaryText={'11:30 am'} />,
      <MenuItem key={`time_24`} value={'12:00 pm'} primaryText={'12:00 pm'} />,
      <MenuItem key={`time_25`} value={'12:30 pm'} primaryText={'12:30 pm'} />,
      <MenuItem key={`time_26`} value={'1:00 pm'} primaryText={'1:00 pm'} />,
      <MenuItem key={`time_27`} value={'1:30 pm'} primaryText={'1:30 pm'} />,
      <MenuItem key={`time_28`} value={'2:00 pm'} primaryText={'2:00 pm'} />,
      <MenuItem key={`time_29`} value={'2:30 pm'} primaryText={'2:30 pm'} />,
      <MenuItem key={`time_30`} value={'3:00 pm'} primaryText={'3:00 pm'} />,
      <MenuItem key={`time_31`} value={'3:30 pm'} primaryText={'3:30 pm'} />,
      <MenuItem key={`time_32`} value={'4:00 pm'} primaryText={'4:00 pm'} />,
      <MenuItem key={`time_33`} value={'4:30 pm'} primaryText={'4:30 pm'} />,
      <MenuItem key={`time_34`} value={'5:00 pm'} primaryText={'5:00 pm'} />,
      <MenuItem key={`time_35`} value={'5:30 pm'} primaryText={'5:30 pm'} />,
      <MenuItem key={`time_36`} value={'6:00 pm'} primaryText={'6:00 pm'} />,
      <MenuItem key={`time_37`} value={'6:30 pm'} primaryText={'6:30 pm'} />,
      <MenuItem key={`time_38`} value={'7:00 pm'} primaryText={'7:00 pm'} />,
      <MenuItem key={`time_39`} value={'7:30 pm'} primaryText={'7:30 pm'} />,
      <MenuItem key={`time_40`} value={'8:00 pm'} primaryText={'8:00 pm'} />,
      <MenuItem key={`time_41`} value={'8:30 pm'} primaryText={'8:30 pm'} />,
      <MenuItem key={`time_42`} value={'9:00 pm'} primaryText={'9:00 pm'} />,
      <MenuItem key={`time_43`} value={'9:30 pm'} primaryText={'9:30 pm'} />,
      <MenuItem key={`time_44`} value={'10:00 pm'} primaryText={'10:00 pm'} />,
      <MenuItem key={`time_45`} value={'10:30 pm'} primaryText={'10:30 pm'} />,
      <MenuItem key={`time_46`} value={'11:00 pm'} primaryText={'11:00 pm'} />,
      <MenuItem key={`time_47`} value={'11:30 pm'} primaryText={'11:30 pm'} />
    ]
  }

  durationItems() {
    const durations = [
      '30 minutes','1 hour','1.5 hours','2 hours',
      '3 hours','4 hours','5 hours','6 hours','7 hours'
    ];
    return durations.map((duration, i) => {
      return (
        <MenuItem key={`dur_${i}`} 
          value={duration}
          primaryText={duration}  />
      )
    });
  }

  timeDataSource = [
    '12:00 am', '12:30 am', '1:00 am', '1:30 am', '2:00 am',
    '2:30 am', '3:00 am', '3:30 am', '4:00 am', '4:30 am',
    '5:00 am', '5:30 am', '6:00 am', '6:30 am', '7:00 am',
    '7:30 am', '8:00 am', '8:30 am', '9:00 am', '9:30 am',
    '10:00 am', '10:30 am', '11:00 am', '11:30 am', '12:00 pm',
    '12:30 pm', '1:00 pm', '1:30 pm', '2:00 pm', '2:30 pm', '3:00 pm',
    '3:30 pm', '4:00 pm', '4:30 pm', '5:00 pm', '5:30 pm', '6:00 pm',
    '6:30 pm', '7:00 pm', '7:30 pm', '8:00 pm', '8:30 pm', '9:00 pm',
    '9:30 pm', '10:00 pm', '10:30 pm', '11:00 pm', '11:30 pm'
  ];
}