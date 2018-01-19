import * as React from 'react';
import autobind from 'autobind-decorator';
import * as openSocket from 'socket.io-client';
import { Grid, Row, Col } from 'react-flexbox-grid';
import {
  Drawer, FlatButton,
  RaisedButton, TextField,
  Checkbox
} from 'material-ui';

import {
  WebExMeetNowDialog
} from '../MeetNow';


import ActionLock from 'material-ui/svg-icons/action/lock';
import ActionLockOpen from 'material-ui/svg-icons/action/lock-open';

export class WebExSettings extends React.Component<any,any> {
  state = {
    passwordField: 'password',
    saveBtnLabel: 'Save',
    saveBtnRefreshIcon: false,
    backGroundColor: 'white',
    webExMeetingBtnLabel: 'MEET NOW',
    meetNowDialog: false
  };

  componentWillReceiveProps(props) {
    let { authResult } = props;
    if(authResult === 'SUCCESS') {
      this.updateState('success');
    } else if(authResult === 'FAILURE') {
      this.props.onWebExChange('authResult', null);
      this.updateState('failure');
    }
  }

  @autobind
  updateState(action: string) {
    let {
      saveBtnLabel,
      saveBtnRefreshIcon,
      backGroundColor
    } = this.state;
    if(action === 'checking') {
      saveBtnLabel = '';
      backGroundColor = 'white';
      saveBtnRefreshIcon = true;
    } else if(action === 'success') {
      saveBtnLabel = 'Continue';
      saveBtnRefreshIcon = false;
      backGroundColor = '#4CAF50';
    } else if(action === 'failure') {
      saveBtnLabel = 'Auth Error';
      saveBtnRefreshIcon = false;
      backGroundColor = '#F44336'
    }
    this.setState({ saveBtnLabel, saveBtnRefreshIcon, backGroundColor });
  }

  render() {
    let {
      api,
      webex,
      webExSettingsEditor,
      authResult
    } = this.props;
    return (
      <div>
        <FlatButton
          label='WebEx'
          primary={true}
          icon={
            <i className='mdi mdi-account-settings-variant mdi-18px'
               style={{ color: 'rgb(55,103,52)' }} />
          }
          style={{
            position: 'absolute',
            top:0,
            right:0,
            color: 'rgb(55,103,52)'
          }}
          onClick={this.props.open} />
        <Drawer
          open={webExSettingsEditor}
          openSecondary={true}
          containerStyle={{ height: 235 }}
          width={275}>
          <div style={{marginLeft:'20px'}}>
            <Row middle='xs'>
              <Col xs={12}>
                <div style={{textAlign: 'center', marginTop:'15px', marginBottom: '10px'}}>
                  <i className='mdi mdi-cisco-webex mdi-24px'
                    style={{ color: 'rgb(55,103,52)' }} />
                  <strong style={{fontSize:'110%', marginBottom:'-20px'}}> Cisco WebEx Settings </strong>
                </div>
              </Col>
            </Row>
            <Row>
              <Col xs={10}>
                <TextField
                  fullWidth={true}
                  value={webex.webExId}
                  autoFocus
                  hintText='WebEx ID'
                  onChange={(e, val) => {
                    this.props.onWebExChange('webExId', val);
                  }} />
              </Col>
            </Row>
            <Row>
              <Col xs={9}>
                <TextField
                  value={webex.webExPassword}
                  fullWidth={true}
                  hintText='WebEx Password'
                  type={this.state.passwordField}
                  onChange={(e, val) => {
                    this.props.onWebExChange('webExPassword', val);
                  }} />
              </Col>
              <Col xs={1}>
                <Checkbox
                  style={{marginTop:'18px'}}
                  defaultChecked={false}
                  checkedIcon={<ActionLockOpen />}
                  uncheckedIcon={<ActionLock />}
                  iconStyle={{width:20, height:20}}
                  onCheck={(e:any, checked:boolean) => {
                    let { passwordField } = this.state;
                    if(checked) passwordField = 'text';
                    else passwordField = 'password';
                    this.setState({ passwordField });
                  }}
                />
              </Col>
            </Row>
            <Row>
              <Col sm={5}>
                <FlatButton
                  fullWidth={true}
                  style={{ marginTop: '25px', marginLeft: '5px' }}
                  label='Cancel'
                  hoverColor='#FFCDD2'
                  onClick={this.props.close} />
              </Col>
              <Col sm={5}>
                <FlatButton
                  fullWidth={true}
                  style={{ marginTop: '25px', marginLeft: '5px' }}
                  backgroundColor={this.state.backGroundColor}
                  icon={
                    <i className='mdi mdi-refresh mdi-spin mdi-24px' 
                      style={{
                        display: this.state.saveBtnRefreshIcon ? 'inline-block': 'none',
                        color: '#673AB7'
                      }} />
                  }
                  hoverColor='#D1C4E9'
                  label={this.state.saveBtnLabel}
                  primary={true}
                  onClick={this.saveCredentials} />
              </Col>
            </Row>
          </div>
        </Drawer>
      </div>
    );
  }

  @autobind
  saveCredentials() {
    let { webex } = this.props,
        { saveBtnLabel, backGroundColor } = this.state;
    if(saveBtnLabel === 'Continue') {
      this.props.onWebExChange('authResult', null);
      this.setState({
        backGroundColor: 'white',
        saveBtnLabel: 'Save'
      });
      this.props.close();
    } else if(saveBtnLabel === 'Save') {
      this.updateState('checking');
      this.props.save();
    } else if(saveBtnLabel === 'Auth Error') {
      this.updateState('checking');
      this.props.save();
    }
  }
}