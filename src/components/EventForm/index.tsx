import * as React from 'react';
import {  Grid, Row, Col } from 'react-flexbox-grid';
import { TextField } from 'material-ui';

export class EventForm extends React.Component<any, any> {
  state = { errorText: '', title: '' }

  meetingProps = (e: any, value: string) => {
    let { name } = e.target;
    this.props.inputChange(name, value);
    if(name==='title') this.setState({ title: value });
  }

  styles = {
    textField: {
      width: 400, maxWidth: 570
    }
  }

  titleFocus = () => {
    if(this.state.errorText) this.setState({ errorText: '' });
  }

  titleBlur = () => {
    if(!this.state.title)
      this.setState({ errorText: 'This Field is Required' });
  }

  render() {
    return (
      <div>
        <Row>
          <Col xs={12}>
            <TextField
              name='title'
              value={this.state.title}
              autoFocus
              hintText='Title'
              style={this.styles.textField}
              errorText={this.state.errorText}
              onFocus={this.titleFocus}
              onChange={this.meetingProps}
              onBlur={this.titleBlur} />
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