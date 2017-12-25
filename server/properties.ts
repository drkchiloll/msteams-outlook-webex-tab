export namespace Properties {
  export const WebEx = {
    "uri": "https://<<SITENAME>>.webex.com/WBXService/XMLService",
    "siteName": "<<YOUR SITE NAME>>",
    "xsitype": "java:com.webex.service.binding",
    "xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "schema": "http://www.webex.com/schemas/2002/06/service",
    "headers": "{'Content-Type': 'application/xml'}",
    "user": "<<DEV>>",
    "password": "<<DEV>>"
  }

  export const MsGraph = {
    uri: 'https://graph.microsoft.com/v1.0',
    headers: { 'Content-Type': 'application/json' }
  }
}