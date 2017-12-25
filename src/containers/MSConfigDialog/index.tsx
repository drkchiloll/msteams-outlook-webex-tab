import * as React from 'react';
import autobind from 'autobind-decorator';
import { TextField } from 'office-ui-fabric-react';
import { microsoftTeams } from '../../microsoftTeams';
import { Properties } from '../../properties';
let {AzureApp: {contentUrl, websiteUrl}} = Properties;

// Initialize Microsoft Teams Tab Library
microsoftTeams.initialize();
export class ConfigDialog extends React.Component<any, any> {
  constructor(props) {
    super(props);
    // Configure the save event
    this.state = {
      tabName: 'Tab Auth Sample'
    }
    microsoftTeams
      .settings
      .registerOnSaveHandler((saveEvent) => {
        // Save the settings for the tab and notify of success
        microsoftTeams.settings.setSettings({
          contentUrl,
          suggestedDisplayName: this.state.tabName,
          websiteUrl
        });
        saveEvent.notifySuccess();
      });

    // Automatically set the save state to success
    microsoftTeams.settings.setValidityState(true);
  }

  @autobind
  tabChange(tabName) {
    this.setState({ tabName });
  }

  render() {
    return (
      <div>
        <p>
          TODO: here you could display config form...
          at minimum allow user to set tab name
        </p>
        <TextField label='Tab Name' value={this.state.tabName} onChanged={this.tabChange}/>
      </div>
    );
  }
}