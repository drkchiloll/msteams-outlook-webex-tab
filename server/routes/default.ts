import * as express from 'express';
import { Request, Response } from 'express';
import * as path from 'path';

const ROOT_DIR = path.join(__dirname, '../../public');

export let router: express.Router = express.Router();

// middleware to use for all requests
router.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

router.get('/*', (req, res) => {
  let file: string;
  if(req.url.includes('.png') || 
    req.url.includes('.jpg') ||
    req.url.includes('.js') ||
    req.url.includes('.css')) {
    file = req.url;
  } else {
    file = '/index.html';
  }
  res.sendFile(ROOT_DIR + file);
});