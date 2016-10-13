var express = require('express');
var router  = express.Router();
var nodemailer = require('nodemailer');
var ses = require('nodemailer-ses-transport');
var models = require('./models');

var transporter = nodemailer.createTransport(ses({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, //AWS key id
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, //AWS secret
    region: 'eu-west-1'
}));

//Emails that been verified that we can send from
var verifiedFromEmails = ['valberedning@d.kth.se'];

var errorMessage = function(res, message) {
  res.status(400);
  res.send(message);
}

var sendMail = function(req, res) {
    //Do some error checking
    if (!req.body.to) return errorMessage(res, 'Missing field: to');
    //We only allow to send from verified email addresses or anything ending with @datasektionen.se.
    if (!req.body.from) return errorMessage(res, 'Missing field: from');
    if (!(verifiedFromEmails.indexOf(req.body.from) < 0 || !req.body.from.endsWith('@datasektionen.se'))) {
        return errorMessage(res, 'Invalid from address: ' + req.body.from);
    }
    if (!req.body.subject) return errorMessage(res, 'Missing field: subject');
    if (!req.body.html) return errorMessage(req, 'Missing field: html');

    //Optional replyTo field, either the same as from or anything you want.
    var replyTo = req.body.replyTo || req.body.from;

    var email = {
        from: req.body.from, // sender address
        replyTo: replyTo, // Not needed unless this address will be different from the above.
        to: req.body.to, // list of receivers
        subject: req.body.subject, // Subject line
        html: req.body.html // html body
    };

    transporter.sendMail(email, function(err, info){
        if (err){
          console.log(err);
          res.status(400);
          res.send('email message error');
        } else {
          console.log('Sent email, messageid: ' + info.messageId);
          res.status(200);
          //We are lazy lets just send the info.
          res.send(info);
        }
    });
};

router.post('/sendmail', function(req, res) {
    //check api key such that they are actually allowed to send email
    models.Key.findOne({
        where: {key: req.body.key}
    }).then(function(key) {
        if(!key) return errorMessage(res, 'Bad api key');
        //Otherwise just send the mail.
        sendMail(req, res);
    });
});

module.exports = router;
