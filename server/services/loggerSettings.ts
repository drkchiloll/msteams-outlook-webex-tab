import { properties } from './properties';
const { logging: { level, filename }} = properties;

export class LoggerSettings{
  loggingFormat:any = {
    level,
    timestamp: true
  };
  constructor(type:string){
    if(type === 'file') {
      this.loggingFormat['filename'] = filename;
      this.loggingFormat['json'] = false;
    }
  }
}
