import * as React from 'react';
import autobind from 'autobind-decorator';
import { Grid, Row, Col } from 'react-flexbox-grid';
import {
  Drawer, FlatButton,
  RaisedButton, TextField,
  Checkbox
} from 'material-ui';

import ActionLock from 'material-ui/svg-icons/action/lock';
import ActionLockOpen from 'material-ui/svg-icons/action/lock-open';

export class WebExSettings extends React.Component<any,any> {
  state = { passwordField: 'password' };

  render() {
    let {
      webExSettingsEditor, webex: { webExId, webExPassword }
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
          style={{ position: 'absolute', top: 0, right: 0, color: 'rgb(55,103,52)' }}
          onClick={this.props.open} />
        <Drawer
          open={webExSettingsEditor}
          openSecondary={true}
          containerStyle={{ height: 240 }}
          width={320}>
          <div style={{marginLeft:'20px'}}>
            <Row middle='xs'>
              <Col xs={12}>
                <div style={{textAlign: 'center', marginTop:'15px', marginBottom: '10px'}}>
                  <i className='mdi mdi-cisco-webex mdi-24px'
                    style={{ color: 'rgb(55,103,52)' }} />
                  <strong style={{fontSize:'110%', marginBottom:'-20px'}}> WebEx Settings </strong>
                </div>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <TextField
                  value={webExId}
                  hintText='WebEx ID'
                  onChange={(e, val) => {
                    this.props.onWebExChange('webExId', val);
                  }} />
              </Col>
            </Row>
            <Row>
              <Col xs={9}>
                <TextField
                  value={webExPassword}
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
              <Col xs={5}>
                <FlatButton
                  fullWidth={true}
                  style={{ marginTop: '25px' }}
                  label='Cancel'
                  onClick={this.props.close} />
              </Col>
              <Col xs={6}>
                <FlatButton
                  fullWidth={true}
                  style={{ marginTop: '25px' }}
                  label='Save'
                  primary={true}
                  onClick={this.props.close} />
              </Col>
            </Row>
          </div>
        </Drawer>
      </div>
    );
  }
}