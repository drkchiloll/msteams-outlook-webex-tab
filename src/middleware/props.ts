import * as properties from '../../properties.json';

export interface MsProps {
  clientId: string;
  uri: string;
  authority: string;
  scopes: String[];
  webApi: string;
  tenant: string;
  redirectUri: string;
  websiteUrl: string;
  baseUrl: string;
  headers: Object;
  entityId: string;
  teamsUrl: string;
  connectorUrl: string;
  contentUrl: string;
}

export interface WebExProps {
  baseUrl: string;
  uri: string;
  siteName: string;
  xsitype: string;
  xsi: string;
  schema: string;
  headers: Object;
}

export interface LogProps {
  level: string;
  filename: string;
}

export interface PropTypes {
  msApp: MsProps;
  webex: WebExProps;
  logging: LogProps;
}

export const Properties: PropTypes = properties;
// export { Properties };

