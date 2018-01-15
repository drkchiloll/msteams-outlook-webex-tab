import * as React from 'react';
import * as $ from 'jquery';
import autobind from 'autobind-decorator';
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
      tabName: ''
    }
    microsoftTeams
      .settings
      .registerOnSaveHandler((saveEvent) => {
        // Save the settings for the tab and notify of success
        microsoftTeams.settings.setSettings({
          contentUrl,
          suggestedDisplayName: this.state.tabName,
          websiteUrl,
          entityId: 'webex-scheduler'
        });
        saveEvent.notifySuccess();
      });

    // Automatically set the save state to success
    microsoftTeams.settings.setValidityState(true);
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
        </Grid>
      </div>
    );
  }
}