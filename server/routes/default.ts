import * as express from 'express';
import { Request, Response } from 'express';
import * as path from 'path';

export let router: express.Router = express.Router();

// middleware to use for all requests
router.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

router.post('/', (req, res) => {
  console.log(req.query);
  // res.status(200).send(req.query.token);
  res.redirect(`/?token=${req.query.token}`);
  // res.sendFile(path.join(__dirname, '../../public/index.html'))
  // res.send(req.body)
})
.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '../../public/index.html'))
);
router.get('/config', (req, res) => {
  // console.log(req.params);
  res.sendFile(path.join(__dirname, '../../public/index.html'))
});
router.get('/auth', (req, res) => {
  console.log(req.params);
  res.sendFile(path.join(__dirname, '../../public/index.html'))
});
router.get('/vendor.bundle.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/vendor.bundle.js'))
});
router.get('/bundle.js', (req, res) =>
  res.sendFile(path.join(__dirname, '../../public/bundle.js')))
router.get('/styles.css', (req, res) =>
  res.sendFile(path.join(__dirname, '../../public/styles.css')))