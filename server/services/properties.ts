import * as fs from 'fs';

let propsFile = '/var/atc/ms-webx-api.json';
let localPropsFile='../../properties.json';
let props:any = null;

if(fs.existsSync(propsFile))
  props = require(propsFile);
else{
  props = require(localPropsFile);
}
export { props as properties };