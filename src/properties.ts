export namespace Properties {
  export const AzureApp = {
    "clientId": "<Your AppId>",
    "authority": "https://login.microsoftonline.com/<Your Tenant ID..or domain>",
    "scopes": [
      "user.read", "calendars.readwrite",
      "calendars.read.shared", "user.read.all",
      "directory.read.all"
    ],
    "webApi": "https://graph.microsoft.com/v1.0",
    "tenant": "<Your TenantID>",
    "redirectUri": "<Your URL>",
    "contentUrl": "<Your URL>",
    "websiteUrl": "<Your URL>",
    "headers": { 'Content-Type': 'application/json' }
  }
}
