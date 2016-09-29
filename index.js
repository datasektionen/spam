var nodemailer = require('nodemailer');
var ses = require('nodemailer-ses-transport');
var transporter = nodemailer.createTransport(ses({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID; //AWS key id
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY; //AWS secret
    region: 'eu-west-1' 
}));

//TODO:
// * we will have send limit, do some delay if we need to.
// * resend mail if we fail to send it? Retry certain amount of times with backoff?
// * 

//Example email.
var email = {
    from: '"Valberedningen" <valberedning@d.kth.se>', // sender address
    replyTo: "valberedning@d.kth.se", // Not needed unless this address will be different from the above.
    to: 'addem1234@gmail.com', // list of receivers
    subject: 'Test Hello ✔', // Subject line
    text: 'Hello världen 🐴', // plaintext body
    html: '<b>Hello världen 🐴</b>' // html body
};

transporter.sendMail(email, function(err, info){
    if (err ){
      console.log(err);
    }
    else {
      console.log('Message sent: ' + info.response);
    }
});
