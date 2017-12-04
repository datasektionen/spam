const router  = require('express').Router();

const fetch = require('node-fetch');

const nodemailer = require('nodemailer');
const ses = require('nodemailer-ses-transport');
const Email = require('email-templates');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const converter = require('html-to-markdown');

const md = require('markdown-it')({
  html: true,
  linkify: true
});


const transporter = nodemailer.createTransport(ses({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, //AWS key id
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, //AWS secret
    region: 'eu-west-1'
}));

//Emails that been verified that we can send from
const verifiedFromEmails = ['valberedning@d.kth.se'];

const errorMessage = (res, message) => {
  res.status(400);
  res.send(message);
}

const sendMail = (req, res) => {
    //Do some error checking
    if (!req.body.to) return errorMessage(res, 'Missing field: to');
    if (!req.body.from) return errorMessage(res, 'Missing field: from');
    if (!req.body.subject) return errorMessage(res, 'Missing field: subject');
    if (req.body.html) {
      req.body.content = converter.convert(req.body.html);
    } else if (!req.body.content) {
      return errorMessage(res, 'Missing field: content');
    }

    //We only allow to send from verified email addresses or anything ending with @datasektionen.se.
    const isVerified = verifiedFromEmails.includes(req.body.from);
    const isDatasektionen = req.body.from.endsWith('@datasektionen.se');
    if (!(isVerified || isDatasektionen)) {
        return errorMessage(res, 'Invalid from address: ' + req.body.from);
    }

    const template = req.body.template;
    //TODO: Check that the template exists!
    if(template && false)
      return errorMessage(res, 'Invalid template: ' + template);

    //Optional replyTo field, either the same as from or anything you want.
    const replyTo = req.body.replyTo || req.body.from;

    const email = new Email({
      htmlToText: false,
      transport: transporter,
      views: {
        options: { extension: 'ejs' }
      }
    });

    email.send({
      message: {
        from: req.body.from, // sender address
        replyTo: replyTo, // Not needed unless this address will be different from the above.
        subject: req.body.subject, // Subject has to be templated?
        to: req.body.to, // list of receivers
        attachments: req.files.map(f => ({
          filename: f.originalname,
          content: f.buffer,
          contentType: f.mimetype,
        })),
      },
      template: template || 'default',
      locals: {
        content: md.render(req.body.content),
        raw_content: req.body.content
      }
    }).then(status => {
      console.log('status', status);
      res.status(200);
      res.send(status)
    }).catch(error => {
      console.log('error', error);
      res.status(500);
      res.send(error);
    });
};

const apiCheck = (req, res) => {
    //check api key such that they are actually allowed to send email
    fetch('https://pls.datasektionen.se/api/token/' + req.body.key + '/spam')
    .then(response => response.json())
    .then(json => {
        if(!json.includes('send')) return errorMessage(res, 'Bad api key');
        //otherwise just send the mail.
        sendMail(req, res);
    }).catch(err => {
      console.log('fetch error', err);
      res.status(500)
      res.send(err)
    });
};

router.post('/sendmail', upload.array('attachments[]', 5), apiCheck);
router.post('/sendmail', apiCheck);

module.exports = router;
