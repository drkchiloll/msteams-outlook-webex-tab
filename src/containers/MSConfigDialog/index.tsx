import * as React from 'react';
import * as $ from 'jquery';
import autobind from 'autobind-decorator';
import { microsoftTeams } from '../../microsoftTeams';
import { Properties } from '../../properties';
let {AzureApp: {contentUrl, websiteUrl}} = Properties;

import {
  TextField
} from 'material-ui';

import { Grid, Row, Col } from 'react-flexbox-grid';

// Initialize Microsoft Teams Tab Library
microsoftTeams.initialize();
export class ConfigDialog extends React.Component<any, any> {
  constructor(props) {
    super(props);
    // Configure the save event
    this.state = {
      tabName: '',
      webExId: '',
      webExPassword: ''
    }
    microsoftTeams
      .settings
      .registerOnSaveHandler((saveEvent) => {
        // Save the settings for the tab and notify of success
        microsoftTeams.settings.setSettings({
          contentUrl: contentUrl + `?webExId=${this.state.webExId}&` +
            `webExPassword=${this.state.webExPassword}`,
          suggestedDisplayName: this.state.tabName,
          websiteUrl
        });
        saveEvent.notifySuccess();
      });

    // Automatically set the save state to success
    microsoftTeams.settings.setValidityState(true);
  }

  componentDidMount() {
    setTimeout(() => {
      $('.tab').focus();
    }, 250)
  }

  @autobind
  tabChange(e:any, tabName:string) {
    this.setState({ tabName });
  }

  tabInput(input) {
    if(input) {
      setTimeout(() => { input.focus() }, 500);
    }
  }

  render() {
    return (
      <div>
        <p>
          TODO: here you could display config form...
          at minimum allow user to set tab name
        </p>
        <Grid>
          <Row>
            <Col lg={2}>
              <TextField
                name='tab'
                hintText='Tab Name'
                autoFocus
                onChange={this.tabChange}
                value={this.state.tabName} />            
            </Col>
          </Row>
          <Row>
            <Col lg={2}>
              <TextField
                name='webexId'
                hintText='WebEx UserName'
                onChange={(e:any, webExId:string) => {
                  this.setState({ webExId });
                }}
                value={this.state.webExId} />
            </Col>
          </Row>
          <Row>
            <Col lg={2}>
              <TextField
                hintText='WebEx Password'
                name='webexPassword'
                onChange={(e: any, webExPassword: string) => {
                  this.setState({ webExPassword });
                }}
                value={this.state.webExPassword} />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}