// server.js

// BASE SETUP
// ============================================================================
import * as express from 'express';
import * as http from 'http';
// import * as mongoose from 'mongoose';
import * as debug from 'debug';
import { app } from './routes';
// import { properties } from './services';

// mongoose.connect(properties.mongoUrl, (err:any) => {
//   if(err) throw err;
// });
let server = http.createServer(app);
/**
 * Get port from environment and store in Express.
 */
let port = normalizePort(process.env.PORT || '49990');
app.set('port', port);
/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(app.get('port'), () => {
  console.log('Server listening on port ' + app.get('port'));
});

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val:any) {
  let port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}
