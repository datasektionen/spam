# Spam
A system for sending mail

https://spam.datasektionen.se/api/sendmail

API keys can be generated in the permission system, pls. The key needs to have the permission "send" in the "spam" system.

Api fields: 
* from: no-reply@datasektionen.se //Who it is from. \*.datasektionen.se or another verified address such as valberedning@d.kth.se
* to: foo@example.com, bar@example.com //A comma separated list of emails
* subject: Test email title
* html: \<h1> Hello world \</h1>
* key: 23123wfjkdfhladjh1o24h1u4 //A valid api key
* replyTo: testuser@d.kth.se //Optional, default is the same as from.

![spam](http://media.boingboing.net/wp-content/uploads/2016/01/Spam-Can.jpg)
