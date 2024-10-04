const router = require("express").Router();

const fetch = require("node-fetch");

const nodemailer = require("nodemailer");
const ses = require("nodemailer-ses-transport");
const Email = require("email-templates");

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const converter = require("html-to-markdown");

const md = require("markdown-it")({
  html: true,
  linkify: true,
});

const transporter = nodemailer.createTransport(
  ses({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, //AWS key id
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, //AWS secret
    region: "eu-west-1",
  })
);

// mails that been verified that we can send from. Idk why we have this, but we do.
const VERIFIED_FROM_EMAILS = ["valberedning@d.kth.se", "titel@d.kth.se"];

// Domains we can send from
const VERIFIED_DOMAINS = ["@metaspexet.se", "@datasektionen.se"];

// Templates we can use
const TEMPLATES = ["default", "metaspexet", "none"];

const errorMessage = (res, message) => {
  res.status(400);
  res.send(message);
};

// We don't support the form `Name <email@domain.com>`
// Instead, they can can be in the form: { name: "Name", address: "email@domain.com" }
const verifyDomain = (request, domain) => {
  if (typeof request === "string") {
    return request.endsWith(domain);
  }

  if (
    typeof request === "object" &&
    request.address &&
    typeof request.address === "string"
  ) {
    return request.address.endsWith(domain);
  }

  return false;
};

const sendMail = (req, res) => {
  //Do some error checking
  if (!req.body.to) return errorMessage(res, "Missing field: to");
  if (!req.body.from) return errorMessage(res, "Missing field: from");
  if (!req.body.subject) return errorMessage(res, "Missing field: subject");

  // If html is provided, convert it to markdown and set it as content.
  // If you don't want this, you can just provide raw html in the content field,
  // since our markdown renderer will just ignore it.
  if (req.body.html) {
    req.body.content = converter.convert(req.body.html);
  } else if (!req.body.content) {
    return errorMessage(res, "Missing field: content");
  }

  // We only allow to send from verified email addresses or anything ending with @datasektionen.se and @metaspexet.se
  const isVerified = VERIFIED_FROM_EMAILS.includes(req.body.from);
  const isVerifiedDomain = VERIFIED_DOMAINS.some((domain) =>
    verifyDomain(req.body.from, domain)
  );

  if (!(isVerified || isVerifiedDomain)) {
    return errorMessage(
      res,
      "Invalid from address: " + JSON.stringify(req.body.from)
    );
  }

  const template = req.body.template || "default";
  // Check that the template exists!
  if (!TEMPLATES.includes(template))
    return errorMessage(res, "Invalid template: " + template);

  // Optional replyTo field, either the same as from or anything you want.
  const replyTo = req.body.replyTo || req.body.from;

  const email = new Email({
    htmlToText: true, // Convert html to text automatically, only applies to "none" template
    transport: transporter,
    views: {
      options: { extension: "ejs" },
    },
  });

  console.log(req.body.content);
  console.log(md.render(req.body.content));

  email
    .send({
      message: {
        from: req.body.from, // sender address
        replyTo: replyTo, // Not needed unless this address will be different from the above.
        subject: req.body.subject, // Subject has to be templated?
        to: req.body.to, // list of receivers
        cc: req.body.cc || [], // list of cc
        bcc: req.body.bcc || [], // list of bcc
        attachments: (req.files || []).map((f) => ({
          filename: f.originalname,
          content: f.buffer,
          contentType: f.mimetype,
        })),
      },
      template: template,
      locals: {
        content: md.render(req.body.content),
        raw_content: req.body.content,
      },
    })
    .then((status) => {
      console.log("status", status);
      res.status(200);
      res.send(status);
    })
    .catch((error) => {
      console.log("error", error);
      res.status(500);
      res.send(error);
    });
};

const apiCheck = (req, res) => {
  //check api key such that they are actually allowed to send email
  fetch("https://pls.datasektionen.se/api/token/" + req.body.key + "/spam")
    .then((response) => response.json())
    .then((json) => {
      if (!json.includes("send")) return errorMessage(res, "Bad api key");
      //otherwise just send the mail.
      sendMail(req, res);
    })
    .catch((err) => {
      console.log("fetch error", err);
      res.status(500);
      res.send(err);
    });
};

router.post("/sendmail", upload.array("attachments[]", 5), apiCheck);
router.post("/sendmail", apiCheck);

router.get("/ping", (req, res) => {
  res.status(200).send("I'm alive!\n");
});
module.exports = router;
